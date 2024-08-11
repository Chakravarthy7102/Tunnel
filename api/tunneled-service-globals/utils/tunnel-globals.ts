import type { TunnelGlobals } from '#types';
import type { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import chalk from 'chalk';
import Emittery from 'emittery';
import { outdent } from 'outdent';

export const getTunnelGlobals = () =>
	(globalThis as any).__tunnel__ as TunnelGlobals | undefined;

export function createTunnelGlobalsObject({
	tunneledServiceEnvironmentData,
}: {
	tunneledServiceEnvironmentData:
		| TunneledServiceEnvironmentData<
			HostEnvironmentType
		>
		| null;
}) {
	const tunnelGlobalsObject = Object.create(null);

	const defineTunnelProperty = <$Key extends keyof TunnelGlobals>(
		key: $Key,
		value: TunnelGlobals[$Key],
	) => {
		Object.defineProperty(tunnelGlobalsObject, key, {
			configurable: false,
			enumerable: false,
			writable: key === 'tunneledServiceEnvironmentData' && value === null,
			value,
		});
	};

	defineTunnelProperty(
		'originalWindow',
		typeof window === 'undefined' ? ({} as typeof window) : window,
	);
	defineTunnelProperty('nativeFetch', window.fetch);
	defineTunnelProperty('nativeWebSocket', window.WebSocket);
	defineTunnelProperty(
		'tunneledServiceEnvironmentData',
		tunneledServiceEnvironmentData,
	);
	defineTunnelProperty('hideWelcome', () => {
		localStorage.setItem('tunnel:hideWelcome', '1');
		// eslint-disable-next-line no-console -- This should be logged in the user's console
		logger.write(outdent`
			Tunnel's welcome message has been hidden.

			${
			chalk.dim.italic(
				"To show it again, run the following command in your browser's console: `__tunnel__.showWelcome()`",
			)
		}
		`);

		// This will get displayed in the console when it outputs the return value
		return '🙈';
	});
	defineTunnelProperty('showWelcome', () => {
		localStorage.removeItem('tunnel:hideWelcome');
		return '👋';
	});
	defineTunnelProperty('consoleLogsHistory', []);
	defineTunnelProperty('networkLogsHistory', []);
	defineTunnelProperty('sessionBuffer', {
		events: [[]],
	});
	defineTunnelProperty('recording', {
		events: [],
	});
	defineTunnelProperty(
		'portProxying',
		(() => {
			const emittery = new Emittery<{
				portProxyingPermissionRequested: { portNumber: number };
				portProxyRequestBlocked: { portNumber: number; isDisallowed: boolean };
				disallowedPortProxyingNotice: { portNumber: number };
			}>();
			const portNumberToProxyPromptActions = new Map<
				number,
				{
					allow: () => void;
					disallow: () => void;
				}
			>();

			return {
				portNumberToProxyPromptActions,
				onPortProxyPrompt(cb: (data: { portNumber: number }) => void) {
					return emittery.on('portProxyingPermissionRequested', cb);
				},
				onPortProxyRequestBlocked(
					cb: (data: { portNumber: number; isDisallowed: boolean }) => void,
				) {
					return emittery.on('portProxyRequestBlocked', cb);
				},
				blockPortProxyRequest(data: {
					portNumber: number;
					isDisallowed: boolean;
				}) {
					void emittery.emit('portProxyRequestBlocked', data);
				},
				onDisallowedPortProxyingNotice(
					cb: ({ portNumber }: { portNumber: number }) => void,
				) {
					emittery.on('disallowedPortProxyingNotice', ({ portNumber }) => {
						cb({ portNumber });
					});
				},
				async displayDisallowedPortProxyingNotice({
					portNumber,
				}: {
					portNumber: number;
				}) {
					await emittery.emit('disallowedPortProxyingNotice', { portNumber });
				},
				async requestPortProxyingPermission({
					portNumber,
				}: {
					portNumber: number;
				}): Promise<void> {
					await emittery.emit('portProxyingPermissionRequested', {
						portNumber,
					});

					return new Promise((resolve, reject) => {
						portNumberToProxyPromptActions.set(portNumber, {
							allow() {
								resolve();
							},
							disallow() {
								reject(new Error('Proxying this port is not allowed'));
							},
						});
					});
				},
			};
		})(),
	);

	return tunnelGlobalsObject;
}
