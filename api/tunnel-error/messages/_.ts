import type { TunnelMessageData } from '#types';
import tunnelStandardMessages from './standard/_.ts';

export default {
	...tunnelStandardMessages,
} satisfies Record<string, (...args: any[]) => TunnelMessageData>;
