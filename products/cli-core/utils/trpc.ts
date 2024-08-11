import { parseActorString } from '@-/actor';
import { getCliAuthClient } from '@-/auth/cli';
import { getCliStorage } from '@-/cli-storage';
import { RELEASE } from '@-/env/app';
import { createTrpcClient, getAuthorizationHeaders } from '@-/trpc/client';
import { ApiUrl } from '@-/url/api';
import type { WebappTrpc } from '@-/webapp';
import chalk from 'chalk';
import { excludeKeys } from 'filter-obj';
import logSymbols from 'log-symbols';
import onetime from 'onetime';

export const getWebappTrpc: () => Promise<{
	webappTrpc: WebappTrpc;
}> = onetime(async () => {
	const cliStorage = getCliStorage();
	const webappTrpc: WebappTrpc = createTrpcClient({
		siteUrl: `${
			ApiUrl.getWebappUrl({ withScheme: true, fromRelease: RELEASE })
		}/api/trpc`,
		/**
			If we're unauthenticated, we attempt to authenticate
		*/
		async onInvalidAuthToken() {
			const { currentActorString } = await cliStorage.get();
			if (currentActorString !== null) {
				await cliStorage.set((data) => ({
					...data,
					currentActorString: null,
					savedActorsData: excludeKeys(
						data.savedActorsData,
						[currentActorString],
					) as any,
				}));
			}

			process.stdout.write(
				chalk.magentaBright.bold(
					`${logSymbols.error} This command needs you to be logged into the Tunnel CLI\n`,
				) +
					`${logSymbols.info} Try running ${
						chalk.dim('`') + chalk.yellow('tunnel login') + chalk.dim('`')
					} and re-running the command\n`,
			);
			process.exit(1);
		},
		async headers({ op }) {
			const authorizationHeaders = await getAuthorizationHeaders({
				op,
				async getAccessToken() {
					const { currentActorString } = await cliStorage.get();
					if (currentActorString === null) {
						return null;
					}

					const actorUserId = parseActorString(currentActorString).data.id;
					const cliAuthClient = getCliAuthClient();
					const accessToken = await cliAuthClient.getAccessToken({
						actorUserId,
					});

					// If we can't retrieve the token, we should exit the CLI and ask the user to re-authenticate
					if (accessToken === null) {
						process.stderr.write(
							`Session expired; run \`${
								chalk.yellow('tunnel login')
							}\` to re-authenticate\n`,
						);
						process.exit(1);
					}

					return accessToken;
				},
			});

			return {
				...authorizationHeaders,
			};
		},
	});

	return { webappTrpc };
});
