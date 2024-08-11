import type { HostEnvironmentType } from '@-/host-environment';
import type {
	ConsoleLogEntry,
	NetworkLogEntry,
} from '@-/logs';
import type { PageToolbarContext } from '@-/tunnel-instance-page-toolbar';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';

export interface TunnelGlobals {
	originalWindow: typeof window;
	nativeFetch: typeof window.fetch;
	nativeWebSocket: typeof window.WebSocket;
	tunneledServiceEnvironmentData:
		| TunneledServiceEnvironmentData<
			HostEnvironmentType
		>
		| null;
	hideWelcome(): string;
	showWelcome(): string;
	getContext?(): PageToolbarContext;
	networkLogsHistory: NetworkLogEntry[];
	consoleLogsHistory: ConsoleLogEntry[];
	sessionBuffer: {
		events: any[][];
	} | null;
	recording: {
		events: any[];
	};
	portProxying: {
		portNumberToProxyPromptActions: Map<
			number,
			{ allow(): void; disallow(): void }
		>;
		onPortProxyPrompt(cb: (data: { portNumber: number }) => void): void;
		onPortProxyRequestBlocked(
			cb: (data: { portNumber: number; isDisallowed: boolean }) => void,
		): void;
		onDisallowedPortProxyingNotice(
			cb: (data: { portNumber: number }) => void,
		): void;
		blockPortProxyRequest(data: {
			portNumber: number;
			isDisallowed: boolean;
		}): void;
		displayDisallowedPortProxyingNotice(data: { portNumber: number }): void;
		requestPortProxyingPermission(data: { portNumber: number }): Promise<void>;
	};
}
