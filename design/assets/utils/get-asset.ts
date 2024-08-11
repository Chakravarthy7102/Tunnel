import { APP_ENV } from '@-/env/app';

/**
	This function should be used instead of a root path (such as "/images/image.png") when the asset can possibly be loaded from a non-"tunnel.dev" domain
*/
export function getAsset(path: string) {
	return `https://tunnel.${
		APP_ENV === 'development' ? 'test' : 'dev'
	}/assets${path}`;
}
