'use client';

import { FilterBadges } from '#components/v1/filters/filter-badges.tsx';
import { FilterDropdownButton } from '#components/v1/filters/filter-dropdown-button.tsx';
import { useFiltersSelection } from '#components/v1/filters/use-filter.ts';
import { ThreadPreviewCardList } from '#components/v1/thread-preview-card-list.tsx';
import { usePreloadedPaginatedQuery } from '#hooks/preload.ts';
import { useCommentsContext } from '#utils/comment.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { createDoc, select } from '@-/client-doc';
import { useMemoizedAction } from '@-/client-doc/react';
import { NewThreadInput } from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import { type Preloaded } from '@-/convex/react';
import type { api } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$commentsProviderData,
	type Organization_$dashboardPageData,
	Project_$commentsProviderData,
	type Project_$dashboardPageData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import {
	Button,
} from '@-/design-system/v1';
import { isFilterActive } from '@-/project-comment-thread';
import { UserAvatar } from '@-/user/components';
import { excludeKeys } from 'filter-obj';
import { ListFilter, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProjectClientPage({
	preloadedProjectCommentThreads,
}: {
	preloadedProjectCommentThreads: Preloaded<
		typeof api.v.ProjectCommentThread_list_dashboardPageData
	>;
}) {
	const {
		results: projectCommentThreads,
		status,
		loadMore,
		isLoading,
		setQueryArgs,
	} = usePreloadedPaginatedQuery(preloadedProjectCommentThreads);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	const [files, setFiles] = useState<File[]>([]);

	const createOrganizationAction = useMemoizedAction(createDoc.action(
		'Organization',
		(create) => create<typeof Organization_$dashboardPageData>(organization),
	));
	const createProjectAction = useMemoizedAction(createDoc.action(
		'Project',
		(create) => create<typeof Project_$dashboardPageData>(project),
	));

	const commentsContext = useCommentsContext({
		actorUser,
		actorOrganizationMember,
		memoizedCommentThreads: projectCommentThreads,
		memoizedActions: [
			createOrganizationAction,
			createProjectAction,
		],
	});
	const { commentsState } = commentsContext;

	const organizationDoc = select(
		commentsState,
		'Organization',
		createOrganizationAction._id,
		getInclude(Organization_$commentsProviderData),
	);
	const projectDoc = select(
		commentsState,
		'Project',
		createProjectAction._id,
		getInclude(Project_$commentsProviderData),
	);

	const {
		filtersSelection,
		setFiltersSelection,
		filtersChoicesMap,
		clearFiltersSelection,
	} = useFiltersSelection({
		commentsContext,
		organizationId: organizationDoc._id,
		projectId: project._id,
	});

	useEffect(() => {
		setQueryArgs((queryArgs) => ({
			...queryArgs,
			where: {
				...queryArgs.where,
				filtersSelection,
			},
		}));
	}, [filtersSelection, setQueryArgs]);

	const editor = useFullEditor({
		commentsContext,
		organization: organizationDoc,
	});

	const commentThreadDocs = commentsState.commentThreadIds.map((id) =>
		select(
			commentsState,
			'ProjectCommentThread',
			id,
			getInclude(ProjectCommentThread_$commentsProviderData),
		)
	).sort(
		(commentThread1, commentThread2) =>
			commentThread2._creationTime -
			commentThread1._creationTime,
	);

	return (
		<>
			<div className="flex flex-row justify-start items-center gap-x-2 w-full">
				{Object.entries(filtersSelection).some(
						([filterKey, selectedChoices]) =>
							isFilterActive(filterKey, selectedChoices),
					) ?
					(
						<Button onClick={() => clearFiltersSelection()} variant="outline">
							Clear filters
							<XCircle size={14} className="text-muted-foreground" />
						</Button>
					) :
					(
						<FilterDropdownButton
							commentsContext={commentsContext}
							filtersChoicesMap={excludeKeys(filtersChoicesMap, [
								'oneOfProjectIds',
							])}
							filtersSelection={filtersSelection}
							setFiltersSelection={setFiltersSelection}
							variant="outline"
						>
							<ListFilter size={14} className="text-muted-foreground" />
							Filter threads
						</FilterDropdownButton>
					)}
				{Object.entries(filtersSelection).some(
					([filterKey, selectedChoices]) =>
						isFilterActive(filterKey, selectedChoices),
				) && (
					<FilterBadges
						commentsContext={commentsContext}
						filtersChoicesMap={filtersChoicesMap}
						filtersSelection={filtersSelection}
						setFiltersSelection={setFiltersSelection}
					/>
				)}
			</div>

			{editor !== null && (
				<div className="flex flex-row justify-center items-start gap-x-4 w-full">
					<UserAvatar
						size="lg"
						variant="rounded"
						profileImageUrl={actorUser.profileImageUrl}
						name={actorUser.fullName}
					/>
					<NewThreadInput
						commentsContext={commentsContext}
						editor={editor}
						organization={organizationDoc}
						project={projectDoc}
						linkedProjectLivePreview={null}
						gitMetadata={null}
						windowProps={null}
						sessionEventsFile={null}
						sessionEventsThumbnailFile={null}
						shouldUploadLogs={false}
						shouldAutomaticallySendSessionEvents={true}
						files={files}
						setFiles={setFiles}
					/>
				</div>
			)}

			<ThreadPreviewCardList
				commentsContext={commentsContext}
				isDone={status === 'Exhausted'}
				commentThreads={commentThreadDocs}
				organization={organizationDoc}
				isLoading={isLoading}
				loadMore={loadMore}
			/>
		</>
	);
}
