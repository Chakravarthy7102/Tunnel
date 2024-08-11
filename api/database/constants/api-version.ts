import onetime from 'onetime';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- Only used in this file
import convexJson from '../convex.json';

/**
	The API version must always be a number so that we know the order of deployments (e.g. in case we want to preserve certain functions for an instant rollback).
*/
export const getBundledDatabaseApiVersion = onetime(() => {
	const apiVersion = process.env.NEXT_PUBLIC_TUNNEL_DATABASE_API_VERSION ??
		process.env.TUNNEL_DATABASE_API_VERSION;

	if (!apiVersion) {
		if (process.env.CONVEX !== undefined || process.env.VERCEL !== undefined) {
			return convexJson.version;
		} else {
			throw new Error('TUNNEL_DATABASE_API_VERSION must be set');
		}
	}

	return Number(apiVersion);
});
