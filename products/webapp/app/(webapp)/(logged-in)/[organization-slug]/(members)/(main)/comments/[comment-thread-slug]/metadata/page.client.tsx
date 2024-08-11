'use client';

import { useRouteContext } from '#utils/route-context.ts';
import { MetadataCard } from '@-/comments';

export default function ClientPage() {
	const { commentThread } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/comments/[comment-thread-slug]',
	);
	return (
		<MetadataCard
			commentThread={commentThread}
		/>
	);
}
