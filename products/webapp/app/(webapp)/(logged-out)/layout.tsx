import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export default async function LoggedOutLayout(
	{ children }: PropsWithChildren,
) {
	const actorUser = await WebappApiActor.from(getUser(), {
		redirectOnNull: false,
		include: {},
	});
	if (actorUser !== null) {
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	}

	return (
		<div className="min-h-screen h-full flex flex-col justify-center items-center bg-v2-background">
			{children}
		</div>
	);
}
