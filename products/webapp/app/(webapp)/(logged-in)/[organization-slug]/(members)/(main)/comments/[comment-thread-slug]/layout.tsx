import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import LayoutClient from './layout.client.tsx';

export default async function OrganizationProjectCommentThreadPage({
	params: {
		'comment-thread-slug': commentThreadId,
		'organization-slug': organizationSlug,
	},
	children,
}: React.PropsWithChildren<{
	params: {
		'comment-thread-slug': string;
		'organization-slug': string;
	};
}>) {
	const vapi = await getVapi();
	const preloadedProjectCommentThread = await ApiConvex.preloadProtectedQuery(
		vapi.v.ProjectCommentThread_get_projectCommentThreadPageData,
		{ from: { id: commentThreadId as Id<'ProjectCommentThread'> } },
		{ token: null },
	);

	if (isNonNullPreloaded(preloadedProjectCommentThread)) {
		return (
			<LayoutClient
				preloadedProjectCommentThread={preloadedProjectCommentThread}
			>
				{children}
			</LayoutClient>
		);
	} else {
		const actorUser = await WebappApiActor.from(getUser(), {
			include: {},
		});
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({
				actorUser,
				organization: { slug: organizationSlug },
			}),
		);
	}
}
