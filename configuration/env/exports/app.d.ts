import type { Release } from '@tunnel/release';

export type AppEnv =
	| 'development'
	| 'test'
	| 'production';

export const APP_ENV: AppEnv;
export const RELEASE: 'staging' | 'production' | null;
export function getEnvironmentFromAppEnv(): 'production' | 'ci' | 'development';
/**
	@param sld - Second-level domain (e.g. "tunnel" or "tunnelapp").
*/
export function getHostnameFromRelease(
	args: { sld: 'tunnel' | 'tunnelapp'; release?: Release },
): string;
export function getHostnameFromHeaders(
	headers: Headers,
): string;
export function getHostnameFromWindow(
	window: Window | string,
): string;
