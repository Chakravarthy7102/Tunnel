'use client';

import './rrweb.scss';
import { HeaderContainer } from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { createDoc, noopAction, select } from '@-/client-doc';
import { useMemoizedAction } from '@-/client-doc/react';
import {
	FirstComment,
} from '@-/comments';
import type { api } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	type Organization_$dashboardPageData,
	type Project_$commentsProviderData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import LayoutContext from './context.ts';

export default function LayoutClient({
	preloadedProjectCommentThread,
	children,
}: {
	preloadedProjectCommentThread: NonNullPreloaded<
		typeof api.v.ProjectCommentThread_get_projectCommentThreadPageData
	>;
	children: React.ReactNode;
}) {
	const [projectCommentThread] = usePreloadedQueryState(
		preloadedProjectCommentThread,
	);

	const router = useRouter();
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const createOrganizationAction = useMemoizedAction(createDoc.action(
		'Organization',
		(create) => create<typeof Organization_$dashboardPageData>(organization),
	));
	const createProjectAction = useMemoizedAction(
		projectCommentThread === null ? noopAction as never : createDoc.action(
			'Project',
			(create) =>
				create<typeof Project_$commentsProviderData>(
					projectCommentThread.project,
				),
		),
	);
	const memoizedCommentThreads = useMemo(
		() => projectCommentThread === null ? [] : [projectCommentThread],
		[projectCommentThread],
	);
	const commentsContext = useCommentsContext({
		actorUser,
		actorOrganizationMember,
		memoizedCommentThreads,
		memoizedActions: [
			createOrganizationAction,
			createProjectAction,
		],
	});

	const { commentsState } = commentsContext;

	const commentThread = select(
		commentsState,
		'ProjectCommentThread',
		projectCommentThread?._id ?? null,
		getInclude(ProjectCommentThread_$commentsProviderData),
	);

	const pathname = usePathname();

	const navigationPath = pathname.split('/')[4] ?? 'feed';

	if (commentThread === null) {
		router.replace(`/${organization.slug}`);
		return null;
	}

	const firstComment = commentThread.comments[0];

	return (
		<LayoutContext.Provider
			value={{
				commentThread,
				commentsContext,
			}}
		>
			<HeaderContainer>
				<Button
					size="xs"
					variant="outline"
					onClick={async () => {
						router.push(`/${organization.slug}/`);
					}}
					className="gap-x-2"
				>
					<ArrowLeft size={12} />
					All comments
				</Button>
			</HeaderContainer>
			<DashboardContainer>
				{firstComment !== undefined && (
					<FirstComment
						commentsContext={commentsContext}
						commentThread={commentThread}
						comment={firstComment}
						activeSection={navigationPath}
						setActiveSection={(
							section: 'feed' | 'console' | 'network' | 'metadata',
						) => {
							if (section === 'feed') {
								router.push(
									`/${organization.slug}/comments/${commentThread._id}/`,
								);
							} else {
								router.push(
									`/${organization.slug}/comments/${commentThread._id}/${section}`,
								);
							}
						}}
					/>
				)}
				{children}
			</DashboardContainer>
		</LayoutContext.Provider>
	);
}
