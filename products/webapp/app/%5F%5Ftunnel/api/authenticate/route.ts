import { ApiConvex } from '@-/convex/api';
import { ApiCookies } from '@-/cookies/api';
import { HostEnvironmentType } from '@-/host-environment';
import { encode } from 'js-base64';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new globalThis.URL(request.url);

	const redirectUrl = searchParams.get('redirectUrl');
	if (redirectUrl === null) {
		return new Response('Missing "redirectUrl" query paramater', {
			status: 400,
		});
	}

	const accessToken = searchParams.get('accessToken');
	if (accessToken === null) {
		return new Response('Missing "accessToken" query paramater', {
			status: 400,
		});
	}

	const refreshToken = searchParams.get('refreshToken');
	if (refreshToken === null) {
		return new Response('Missing "refreshToken" query paramater', {
			status: 400,
		});
	}

	const actorUserId = searchParams.get('actorUserId');
	if (actorUserId === null) {
		return new Response('Missing "actorUserId" query paramater', {
			status: 400,
		});
	}

	const hostEnvironmentType = searchParams.get(
		'hostEnvironmentType',
	) as HostEnvironmentType | null;
	if (hostEnvironmentType === null) {
		return new Response('Missing "hostEnvironmentType" query paramater', {
			status: 400,
		});
	}

	if (hostEnvironmentType === HostEnvironmentType.scriptTag) {
		// We redirect to a hash URL because the hash fragment isn't sent to the server (i.e. will keep authentication credentials exclusively on the client-side)
		// @see https://stackoverflow.com/a/14462350
		const authData = encode(JSON.stringify({
			actorUserId,
			accessToken,
			refreshToken,
		}));
		if (redirectUrl.includes('#')) {
			return Response.redirect(
				redirectUrl.replace(
					'#',
					`#__tunnel_auth_${authData}__`,
				),
			);
		} else {
			return Response.redirect(
				redirectUrl +
					`#__tunnel_auth_${authData}__`,
			);
		}
	} else {
		const tunnelCookies = ApiCookies.get();
		const userResult = await ApiConvex.v.User.get({
			from: { id: actorUserId },
			include: {},
		});

		if (userResult.isErr()) {
			return new Response('Failed to retrieve user', { status: 500 });
		}

		const user = userResult.value;
		if (user === null) {
			return new Response(`User with ID ${actorUserId} not found`, {
				status: 404,
			});
		}

		const headers = new Headers();
		headers.append(
			'set-cookie',
			`${tunnelCookies.accessToken.name}=${accessToken}; Path=/; SameSite=Lax; Secure`,
		);
		headers.append(
			'set-cookie',
			`${tunnelCookies.refreshToken.name}=${refreshToken}; Path=/; SameSite=Lax; Secure`,
		);
		headers.append(
			'set-cookie',
			`${tunnelCookies.actorUserId.name}=${actorUserId}; Path=/; SameSite=Lax; Secure`,
		);

		return NextResponse.redirect(redirectUrl, { headers });
	}
}
