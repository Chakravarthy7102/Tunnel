import {
	getSessionFromCookie,
	setResponseAuthCookies,
} from '#utils/auth.ts';
import { ApiAuth } from '@-/auth/api';
import { type NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': '*',
};

export function OPTIONS() {
	return new Response(null, {
		headers: corsHeaders,
	});
}

export async function POST(request: NextRequest) {
	const session = await getSessionFromCookie(request.cookies, {
		redirectOnNull: false,
	});

	if (session === null) {
		return new Response('No session found', {
			status: 404,
			headers: corsHeaders,
		});
	}

	const newTokensResult = await ApiAuth.authenticateWithRefreshToken({
		refreshToken: session.refreshToken,
	});

	if (newTokensResult.isErr()) {
		return new Response(JSON.stringify(newTokensResult.error), {
			status: 401,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	const { accessToken, refreshToken } = newTokensResult.value;

	const response = new NextResponse('', {
		status: 200,
		headers: corsHeaders,
	});

	await setResponseAuthCookies(response, {
		user: session.user,
		impersonator: session.impersonator,
		accessToken,
		refreshToken,
	});

	return response;
}
