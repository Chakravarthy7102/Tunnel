import { ApiAuth } from '@-/auth/api';
import { z } from '@-/zod';
import { NextResponse } from 'next/server';

const bodySchema = z.object({ refreshToken: z.string() });

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

export async function POST(request: Request) {
	const jsonResult = bodySchema.safeParse(await request.json());
	if (!jsonResult.success) {
		return new Response('Missing refresh token in request body', {
			status: 400,
			headers: corsHeaders,
		});
	}

	const { refreshToken } = jsonResult.data;

	const newTokensResult = await ApiAuth.authenticateWithRefreshToken({
		refreshToken,
	});

	if (newTokensResult.isErr()) {
		return new Response(JSON.stringify(newTokensResult.error), {
			status: 401,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}

	return NextResponse.json(newTokensResult.value, {
		headers: corsHeaders,
	});
}
