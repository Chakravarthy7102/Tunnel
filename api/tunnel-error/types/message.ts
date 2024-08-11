import type Message from '#messages/_.ts';
import type Standard from '#messages/standard/_.ts';

export interface TunnelMessageData {
	title: string;
	variant: 'error' | 'message';
	description?: string;
}

export type TunnelStandardMessageKey = keyof typeof Standard;
export type TunnelMessageKey = keyof typeof Message;
