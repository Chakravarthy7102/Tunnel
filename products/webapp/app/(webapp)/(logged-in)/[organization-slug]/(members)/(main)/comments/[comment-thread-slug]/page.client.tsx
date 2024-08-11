'use client';

import { useRouteContext } from '#utils/route-context.ts';
import { createDoc } from '@-/client-doc';
import { useMemoizedAction } from '@-/client-doc/react';
import { Comment, IntegrationActivity, ThreadReplyInput } from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import type {
	Organization_$commentsProviderData,
} from '@-/database/selections';
import { UserAvatar } from '@-/user/components';

export default function ClientPage() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { commentsContext, commentThread } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/comments/[comment-thread-slug]',
	);

	const createOrganizationAction = useMemoizedAction(
		createDoc.action(
			'Organization',
			(create) =>
				create<typeof Organization_$commentsProviderData>(organization),
		),
	);

	const organizationDoc = createOrganizationAction.flatDoc;

	const editor = useFullEditor({
		commentsContext,
		organization: organizationDoc,
	});

	return (
		<>
			<div className="w-full flex flex-col justify-center items-center max-w-3xl gap-y-5">
				<IntegrationActivity
					commentThread={commentThread}
				/>
				{commentThread.comments.length > 1 && (
					<>
						{commentThread.comments.slice(1).sort((comment1, comment2) =>
							comment1._creationTime - comment2._creationTime
						).map((comment) => (
							<Comment
								key={comment._id}
								commentsContext={commentsContext}
								comment={comment}
								shouldRenderReadEditor={true}
							/>
						))}
					</>
				)}
			</div>
			<div className="flex flex-row justify-center items-start w-full max-w-3xl gap-x-3">
				<UserAvatar
					size="sm"
					profileImageUrl={actorUser.profileImageUrl}
					name={actorUser.fullName}
				/>
				{editor !== null && (
					<ThreadReplyInput
						commentsContext={commentsContext}
						editor={editor}
						commentThread={commentThread}
					/>
				)}
			</div>
		</>
	);
}
