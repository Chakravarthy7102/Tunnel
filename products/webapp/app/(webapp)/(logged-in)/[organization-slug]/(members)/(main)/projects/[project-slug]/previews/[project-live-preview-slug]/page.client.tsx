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
	ProjectLivePreview_$commentsProviderData,
	type ProjectLivePreview_$dashboardPageData,
} from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { isFilterActive } from '@-/project-comment-thread';
import { ListFilter, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProjectLivePreviewClientPage({
	preloadedCommentThreads,
}: {
	preloadedCommentThreads: Preloaded<
		typeof api.v.ProjectCommentThread_list_dashboardPageData
	>;
}) {
	const [files, setFiles] = useState<File[]>([]);

	const { results: commentThreads, status, loadMore, isLoading, setQueryArgs } =
		usePreloadedPaginatedQuery(
			preloadedCommentThreads,
		);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);
	const { projectLivePreview } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]/previews/[project-live-preview-slug]',
	);

	const createOrganizationAction = useMemoizedAction(createDoc.action(
		'Organization',
		(create) => create<typeof Organization_$dashboardPageData>(organization),
	));
	const createProjectAction = useMemoizedAction(createDoc.action(
		'Project',
		(create) => create<typeof Project_$dashboardPageData>(project),
	));
	const createProjectLivePreviewAction = useMemoizedAction(createDoc.action(
		'ProjectLivePreview',
		(create) =>
			create<typeof ProjectLivePreview_$dashboardPageData>(projectLivePreview),
	));

	const commentsContext = useCommentsContext({
		actorUser,
		actorOrganizationMember,
		memoizedCommentThreads: commentThreads,
		memoizedActions: [
			createOrganizationAction,
			createProjectAction,
			createProjectLivePreviewAction,
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
	const projectLivePreviewDoc = select(
		commentsState,
		'ProjectLivePreview',
		createProjectLivePreviewAction._id,
		getInclude(ProjectLivePreview_$commentsProviderData),
	);

	const {
		filtersSelection,
		setFiltersSelection,
		filtersChoicesMap,
		clearFiltersSelection,
	} = useFiltersSelection({
		commentsContext,
		organizationId: organization._id,
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
							filtersChoicesMap={filtersChoicesMap}
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
				<NewThreadInput
					commentsContext={commentsContext}
					editor={editor}
					organization={organizationDoc}
					project={projectDoc}
					linkedProjectLivePreview={projectLivePreviewDoc}
					gitMetadata={null}
					windowProps={null}
					sessionEventsFile={null}
					sessionEventsThumbnailFile={null}
					shouldUploadLogs={false}
					shouldAutomaticallySendSessionEvents={true}
					files={files}
					setFiles={setFiles}
				/>
			)}
			<ThreadPreviewCardList
				commentsContext={commentsContext}
				isDone={status === 'Exhausted'}
				isLoading={isLoading}
				commentThreads={commentThreadDocs}
				organization={organizationDoc}
				loadMore={loadMore}
			/>
		</>
	);
}
