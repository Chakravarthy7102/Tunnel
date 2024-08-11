import type { Actor } from '@-/actor';
import { ApiConvex } from '@-/convex/api';
import { parseTunnelCookies } from '@-/cookies';
import type { Id } from '@-/database';
import { normalizeProjectLivePreviewUrl } from '@-/url';
import { $try, type TryOk } from 'errok';
import safeUrl from 'safer-url';

export async function GET(request: Request) {
	const hostHeader = request.headers.get('x-forwarded-host');
	if (hostHeader === null) {
		return new Response('Missing x-forwarded-host header', { status: 400 });
	}

	const hostUrl = safeUrl(`https://${hostHeader}`);
	if (hostUrl === null) {
		return new Response('Invalid host header', { status: 400 });
	}

	const { searchParams } = new globalThis.URL(request.url);
	const actorUserId = (() => {
		const cookie = request.headers.get('cookie');
		return cookie === null ?
			null :
			parseTunnelCookies({ cookieString: cookie }).actorUserId as
				| Id<'User'>
				| undefined;
	})() ?? searchParams.get('actorUserId') as Id<'User'> | null;

	const projectLivePreviewUrl = normalizeProjectLivePreviewUrl(hostUrl);

	const projectLivePreviewResult = await ApiConvex.v.ProjectLivePreview.get(
		{
			from: {
				tunnelappUrl: projectLivePreviewUrl,
			},
			include: {},
		},
	);

	if (projectLivePreviewResult.isErr()) {
		return new Response(
			'Failed to retrieve project live preview',
			{ status: 500 },
		);
	}

	const projectLivePreview = projectLivePreviewResult.value;

	const tunneledServiceActorData = (await getRequestTunneledServiceActorData({
		actorUserId,
		projectLivePreviewId: projectLivePreview?._id ?? null,
	})).unwrapOrThrow();

	return new Response(
		`globalThis.__TUNNELED_SERVICE_ACTOR_DATA__ = ${
			JSON.stringify(tunneledServiceActorData)
		}\ndocument.currentScript.remove()`,
		{
			headers: {
				'Content-Type': 'text/javascript',
			},
		},
	);
}

const getRequestTunneledServiceActorData = ({
	actorUserId,
	projectLivePreviewId,
}: {
	projectLivePreviewId: Id<'ProjectLivePreview'> | null;
	actorUserId: Id<'User'> | null;
}) => ($try(async function*(
	$ok: TryOk<{ actor: Actor<'User'> | null }>,
) {
	const sendNullTunneledServiceActorData = () => $ok({ actor: null });

	if (projectLivePreviewId === null) {
		return $ok({
			actor: actorUserId === null ?
				null :
				{
					type: 'User',
					data: { id: actorUserId },
				},
		});
	}

	const actorUser = actorUserId === null ?
		null :
		yield* ApiConvex.v.User.get({
			from: { id: actorUserId },
			include: {},
		}).safeUnwrap();

	if (actorUser === null) {
		return sendNullTunneledServiceActorData();
	}

	return $ok({
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
	});
}));
