import { createAuthenticateWithCodeRouteHandler } from '#utils/auth-route.ts';

export const GET = createAuthenticateWithCodeRouteHandler({
	oauthProvider: 'github',
});
