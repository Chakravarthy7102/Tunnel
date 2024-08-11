import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import { NextResponse } from 'next/server';

export const redirectActions = {};

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const redirectUrl = searchParams.get('url');
	const webappUrl = ApiUrl.getWebappUrl({
		withScheme: true,
		fromHeaders: request.headers,
	});

	if (redirectUrl === null) {
		logger.debug('Missing "redirectUrl" query parameter, redirecting...');
		return NextResponse.redirect(`${webappUrl}/home`);
	}

	return new Response(null, {
		status: 307,
		headers: {
			Location: redirectUrl,
		},
	});
}
