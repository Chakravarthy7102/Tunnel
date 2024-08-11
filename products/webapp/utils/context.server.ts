import type { Context } from '#types';

export async function createContext({
	workosUserId,
	headers,
	accessToken,
}: {
	workosUserId: string | null;
	headers: Headers;
	accessToken: string | null;
}): Promise<Context> {
	if (accessToken === null || workosUserId === null) {
		return {
			contextType: 'http',
			headers,
			accessToken: null,
		};
	}

	return {
		contextType: 'http',
		headers,
		accessToken,
	};
}
