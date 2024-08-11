import { type Actor } from '@-/actor';
import { getCliAuthClient } from '@-/auth/cli';
import type { ServerDoc } from '@-/database';
import type { User_$profileData } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { clientNextQueryHandlers } from '@-/next-query-handlers/client';
import { ApiUrl } from '@-/url/api';
import { createId } from '@paralleldrive/cuid2';
import Ably from 'ably/promises.js';
import chalk from 'chalk';
import { $try, err, ResultAsync, type TryOk } from 'errok';
import open from 'open';
import ora from 'ora';
import { getCurrentActorData } from './actor.ts';
import { getWebappTrpc } from './trpc.ts';

export const loginWithBrowser = () => ($try(async function*(
	$ok: TryOk<{ userActor: Actor<'User'>; accessToken: string }>,
) {
	const userLoginRequestId = createId();
	const getWebappUrl = ApiUrl.webappUrlFactory({
		fromRelease: RELEASE,
		withScheme: true,
	});
	const loginUrl = getWebappUrl(
		'/authenticate',
		{
			userLoginRequestId,
			next: clientNextQueryHandlers.fulfillLoginRequestOnAuthenticated
				.getQueryValue(
					{
						userLoginRequestId,
						redirectUrl: getWebappUrl('/authentication-successful/cli'),
					},
				),
		},
	);

	process.stdout.write(
		chalk.dim(
			`If your browser doesn't automatically open, copy paste this link into your browser to login:\n${
				chalk.underline(
					loginUrl,
				)
			}\n\n`,
		),
	);

	const loginSpinner = ora('Logging you in via the browser...');
	loginSpinner.start();

	const { webappTrpc } = await getWebappTrpc();
	const { tokenDetails } = (await webappTrpc.userLoginRequest.create.mutate({
		loginRequestId: userLoginRequestId,
	})).unwrapOrThrow();

	const { userActor, refreshToken, accessToken } = yield* ResultAsync
		.fromPromise(
			new Promise<{
				userActor: Actor<'User'>;
				refreshToken: string;
				accessToken: string;
			}>((resolve, reject) => {
				const realtime = new Ably.Realtime({
					tokenDetails,
					authCallback() {},
				});
				const channel = realtime.channels.get(
					`userLoginRequest:${userLoginRequestId}`,
				);
				channel.subscribe('fulfill', (message) => {
					channel.unsubscribe();
					resolve(message.data);
				}).catch(reject);
				void open(loginUrl);
			}),
			(error) => error,
		).safeUnwrap();

	const actorUserId = userActor.data.id;
	const authClient = getCliAuthClient();
	await authClient.setTokens({
		actorUserId,
		tokens: {
			accessToken,
			refreshToken,
		},
	});

	const actorUserData = yield* (await webappTrpc.user.get$profileData.query({
		actor: userActor,
		user: {
			id: actorUserId,
		},
	})).safeUnwrap();

	if (actorUserData === null) {
		return err(new Error('Failed to fetch user data'));
	}

	loginSpinner.succeed(
		`Successfully logged in as ${chalk.bold(actorUserData.username)}`,
	);

	return $ok({
		userActor,
		accessToken,
	});
}));

export const loginWithBrowserIfNotLoggedIn = () => ($try(async function*(
	$ok: TryOk<{
		userActor: Actor<'User'>;
		actorUser: ServerDoc<typeof User_$profileData>;
		accessToken: string;
	}>,
) {
	const { webappTrpc } = await getWebappTrpc();
	const currentActorData = await getCurrentActorData();

	let userActor: Actor<'User'> | null = null;
	let accessToken: string | null = null;
	if (currentActorData !== null) {
		userActor = currentActorData.actor;
		accessToken = currentActorData.accessToken;
	}

	if (userActor === null || accessToken === null) {
		({ userActor, accessToken } = yield* loginWithBrowser().safeUnwrap());
	}

	const userId = userActor.data.id;
	const actorUser = yield* (await webappTrpc.user.get$profileData.query({
		actor: {
			type: 'User',
			data: { id: userId },
		},
		user: {
			id: userId,
		},
	})).safeUnwrap();

	if (actorUser === null) {
		return err(new Error('Failed to fetch user data'));
	}

	return $ok({
		userActor,
		actorUser,
		accessToken,
	});
}));
