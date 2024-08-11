import { ApiUser } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import type { WorkosUser } from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import {
	createCid,
	type SelectInput,
	type SelectOutput,
} from '@-/database';
import { RELEASE } from '@-/env/app';
import type { UnexpectedError } from '@-/errors';
import { logger } from '@-/logger';
import { ApiOrganizationInvitation } from '@-/organization-invitation/api';
import { ApiUrl } from '@-/url/api';
import { $try, err, ok, type ResultAsync } from 'errok';
import crypto from 'node:crypto';

export const ApiUser_create = <
	// dprint-ignore: syntax highlighting breaks if this isn't on a new line
	$Include extends SelectInput<'User'>,
>({
	input: {
		include,
		data,
		isBotUser,
	},
}: {
	input: {
		include: $Include;
		data: {
			email: string;
			fullName: string;
			profileImageUrl: string | null;
			username: string;
		};
		isBotUser?: boolean;
	};
}): ResultAsync<
	SelectOutput<'User', $Include>,
	UnexpectedError
> => ($try(async function*() {
	const existingUserByEmail = yield* ApiConvex.v.User.get({
		from: { email: data.email },
		include,
	}).safeUnwrap();
	if (existingUserByEmail !== null) {
		yield* ApiUser.update({
			input: {
				id: existingUserByEmail._id,
				updates: {
					username: data.username,
					fullName: data.fullName,
					profileImageUrl: data.profileImageUrl,
				},
			},
		}).safeUnwrap();
		return ok(existingUserByEmail);
	}

	if (isBotUser) {
		const user = yield* ApiConvex.v.User._create({
			input: {
				data: {
					workosUserId: null,
					email: 'bot@tunnel.dev',
					fullName: 'Tunnel Bot',
					profileImageUrl: 'https://tunnel.dev/assets/images/logo.png',
					username: 'tunnel-bot',
					callSettings: {
						microphoneDeviceId: null,
						microphoneDeviceName: null,
						speakerDeviceId: null,
						speakerDeviceName: null,
						videoDeviceId: null,
						videoDeviceName: null,
					},
					apiKey: createCid(),
				},
				include,
			},
		}).safeUnwrap();

		return ok(user);
	}

	const workos = getWorkos();
	let workosUser: WorkosUser;
	try {
		workosUser = await workos.userManagement.createUser({
			email: data.email,
			emailVerified: true,
			firstName: data.fullName.split(' ')[0],
			lastName: data.fullName.split(' ')[1],
		});
	} catch (error: any) {
		if (
			error.code === 'user_creation_error' &&
			error.errors.some((error: any) => error.code === 'email_not_available')
		) {
			const workosUsers = await workos.userManagement.listUsers({
				email: data.email,
			});

			const workosUserOrUndefined = workosUsers.data[0];
			if (workosUserOrUndefined === undefined) {
				return err(
					new Error(
						'Unexpected issue while creating WorkOS user',
						{ cause: error },
					),
				);
			} else {
				workosUser = workosUserOrUndefined;
			}
		} else {
			return err(error as Error);
		}
	}

	const user = yield* ApiConvex.v.User._create({
		input: {
			data: {
				...data,
				workosUserId: workosUser.id,
				callSettings: {
					microphoneDeviceId: null,
					microphoneDeviceName: null,
					speakerDeviceId: null,
					speakerDeviceName: null,
					videoDeviceId: null,
					videoDeviceName: null,
				},
				apiKey: crypto.randomBytes(32).toString('hex'),
			},
			include,
		},
	}).safeUnwrap();

	logger.debug(
		`Created Tunnel user with username ${data.username} and email ${data.email}`,
	);

	// If the user's email address belongs to the domain of an organization, create an invitation for them
	const organization = yield* ApiConvex.v.Organization.get({
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- email is guaranteed to contain a domain
		from: { domain: data.email.split('@').at(-1)! },
		include: {
			members: {
				include: {
					user: true,
				},
			},
		},
	}).safeUnwrap();

	if (organization !== null) {
		const ownerOrganizationMember = organization.members.find((member) =>
			member.role === 'owner'
		);
		if (ownerOrganizationMember !== undefined) {
			const result = await ApiOrganizationInvitation.createAndSend({
				webappBaseUrl: ApiUrl.getWebappUrl({
					fromRelease: RELEASE,
					withScheme: true,
				}),
				invitations: [{
					recipientUser: user._id,
					role: 'member',
				}],
				senderUserId: ownerOrganizationMember.user._id,
				organizationId: organization._id,
			});

			if (result.isErr()) {
				logger.error(
					`Failed to send organization invitation for user with email ${data.email}`,
					result.error,
				);
			}
		}
	}

	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	await serverAnalytics.user.created({ userId: user._id });

	return ok(user);
}));

/**
	This function is exposed via `ApiUser` so that we can pass the entire WorkOS user object to the function
*/
export const ApiUser_ensureFromWorkosUser = ({ input: { workosUser } }: {
	input: {
		workosUser: WorkosUser;
	};
}) => ($try(async function*() {
	const user = yield* ApiConvex.v.User._ensureFromWorkosUser({
		input: {
			workosUser: {
				id: workosUser.id,
				email: workosUser.email,
				firstName: workosUser.firstName,
				lastName: workosUser.lastName,
				profilePictureUrl: workosUser.profilePictureUrl,
			},
		},
	}).safeUnwrap();
	return ok(user);
}));
