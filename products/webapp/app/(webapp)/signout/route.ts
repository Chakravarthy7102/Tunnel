import { ApiUrl } from '@-/url/api';
import { type NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
	const loginUrl = ApiUrl.getWebappUrl({
		fromHeaders: request.headers,
		withScheme: true,
		path: '/login',
	});

	const response = NextResponse.redirect(loginUrl);
	response.cookies.delete('wos-session');
	return response;
}
