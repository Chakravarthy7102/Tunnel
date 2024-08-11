'use client';

import {
	FilterContainer,
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { CreateProjectButton } from '#components/v1/create-project-button.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { FilterBadges } from '#components/v1/filters/filter-badges.tsx';
import { FilterDropdownButton } from '#components/v1/filters/filter-dropdown-button.tsx';
import { useFiltersSelection } from '#components/v1/filters/use-filter.ts';
import { ThreadPreviewCardList } from '#components/v1/thread-preview-card-list.tsx';
import {
	usePreloadedPaginatedQuery,
} from '#hooks/preload.ts';
import { useCommentsContext } from '#utils/comment.ts';
import { useRouteContext } from '#utils/route-context.ts';
import {
	type ClientDoc,
	createDoc,
	createManyDoc,
	select,
} from '@-/client-doc';
import { useMemoizedAction } from '@-/client-doc/react';
import { NewThreadInput, ProjectSelect } from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import type { Preloaded } from '@-/convex/react';
import type { api } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$commentsProviderData,
	Project_$commentsProviderData,
	type Project_$organizationData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import {
	Button,
} from '@-/design-system/v1';
import { isFilterActive } from '@-/project-comment-thread';
import { emptyFiltersSelection } from '@-/project-comment-thread/constants';
import { UserAvatar } from '@-/user/components';
import { ListFilter, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrganizationCommentsClientPage({
	preloadedCommentThreads,
}: {
	preloadedCommentThreads: Preloaded<
		typeof api.v.ProjectCommentThread_list_dashboardPageData
	>;
}) {
	const { results: commentThreads, status, isLoading, loadMore, setQueryArgs } =
		usePreloadedPaginatedQuery(preloadedCommentThreads);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const {
		organization,
		projects,
		setProjects,
		actorOrganizationMember,
	} = useRouteContext('(webapp)/(logged-in)/[organization-slug]/(members)');

	const [files, setFiles] = useState<File[]>([]);

	const createOrganizationAction = useMemoizedAction(
		createDoc.action(
			'Organization',
			(create) =>
				create<typeof Organization_$commentsProviderData>(organization),
		),
	);
	const createManyProjectsAction = useMemoizedAction(
		createManyDoc.action(
			'Project',
			(create) => create<typeof Project_$organizationData>(projects),
		),
	);

	const commentsContext = useCommentsContext({
		actorUser,
		actorOrganizationMember,
		memoizedCommentThreads: commentThreads,
		memoizedActions: [
			createOrganizationAction,
			createManyProjectsAction,
		],
	});

	const { commentsState } = commentsContext;

	const organizationDoc = select(
		commentsState,
		'Organization',
		createOrganizationAction._id,
		getInclude(Organization_$commentsProviderData),
	);

	const projectIds = createManyProjectsAction._ids;
	const projectDocs = projectIds.map((cid) =>
		select(
			commentsState,
			'Project',
			cid,
			getInclude(Project_$commentsProviderData),
		)
	).filter(Boolean);

	const [selectedProject, setSelectedProject] = useState<
		ClientDoc<typeof Project_$organizationData> | null
	>(null);

	const {
		filtersSelection,
		setFiltersSelection,
		filtersChoicesMap,
		clearFiltersSelection,
	} = useFiltersSelection({
		commentsContext,
		organizationId: organizationDoc._id,
		projectId: selectedProject?._id ?? null,
	});

	useEffect(() => {
		if (
			Object.entries(filtersSelection).some(([filterKey, selectedChoices]) =>
				isFilterActive(filterKey, selectedChoices)
			)
		) {
			setQueryArgs((queryArgs) => ({
				...queryArgs,
				where: {
					...queryArgs.where,
					filtersSelection,
				},
			}));
		} else {
			setQueryArgs((queryArgs) => ({
				...queryArgs,
				where: {
					...queryArgs.where,
					filtersSelection: {
						...emptyFiltersSelection,
						oneOfStatus: ['unresolved'],
					},
				},
			}));
		}
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
			<HeaderContainer>
				<div className="flex flex-row justify-between items-center gap-x-2 w-full">
					<HeaderTitle
						actorOrganizationMember={actorOrganizationMember}
					>
						Home
					</HeaderTitle>

					{projectIds.length > 0 &&
						(Object.entries(filtersSelection).some((
								[filterKey, selectedChoices],
							) => isFilterActive(filterKey, selectedChoices)
							) ?
							(
								<Button
									variant="outline"
									onClick={() => {
										clearFiltersSelection();
									}}
								>
									Clear filters
									<XCircle size={14} className="text-muted-foreground" />
								</Button>
							) :
							(
								<FilterDropdownButton
									commentsContext={commentsContext}
									filtersSelection={filtersSelection}
									setFiltersSelection={setFiltersSelection}
									variant="outline"
									filtersChoicesMap={filtersChoicesMap}
									alignDropdownContent="end"
									alignPopoverContent="end"
								>
									<ListFilter size={14} className="text-muted-foreground" />
									Filter threads
								</FilterDropdownButton>
							))}
				</div>
			</HeaderContainer>
			{Object.entries(filtersSelection).some(
				([filterKey, selectedChoices]) =>
					isFilterActive(filterKey, selectedChoices),
			) && (
				<FilterContainer>
					<FilterBadges
						commentsContext={commentsContext}
						filtersChoicesMap={filtersChoicesMap}
						filtersSelection={filtersSelection}
						setFiltersSelection={setFiltersSelection}
					/>
				</FilterContainer>
			)}
			<DashboardContainer>
				{projects.length > 0 ?
					(
						editor !== null && (
							<>
								<div className="flex flex-row justify-center items-start gap-x-4 w-full">
									<UserAvatar
										size="sm"
										profileImageUrl={actorUser.profileImageUrl}
										name={actorUser.fullName}
									/>
									<NewThreadInput
										commentsContext={commentsContext}
										editor={editor}
										gitMetadata={null}
										projectSelectComponent={
											<ProjectSelect
												commentsContext={commentsContext}
												projects={projectDocs}
												selectedProject={selectedProject}
												setSelectedProject={setSelectedProject}
											/>
										}
										organization={organizationDoc}
										project={selectedProject}
										linkedProjectLivePreview={null}
										windowProps={null}
										sessionEventsFile={null}
										sessionEventsThumbnailFile={null}
										shouldAutomaticallySendSessionEvents={true}
										shouldUploadLogs={false}
										files={files}
										setFiles={setFiles}
									/>
								</div>

								<ThreadPreviewCardList
									commentsContext={commentsContext}
									organization={organizationDoc}
									commentThreads={commentThreadDocs}
									isDone={status === 'Exhausted'}
									isLoading={isLoading}
									loadMore={loadMore}
								/>
							</>
						)
					) :
					(
						<div className="flex flex-col justify-center items-center border border-dashed border-input bg-inherit py-6 px-2 gap-y-3 w-full rounded-md">
							<div className="flex flex-col justify-center items-center text-center gap-y-1">
								<p className="text-sm font-medium">No projects</p>
								<p className="text-sm text-muted-foreground">
									Projects help you organize tunnels and make collaborating
									easier.
								</p>
							</div>

							{actorOrganizationMember.role !== 'guest' && (
								<CreateProjectButton
									actorUser={actorUser}
									organization={organization}
									setProjects={setProjects}
									actorOrganizationMember={actorOrganizationMember}
									variant={'outline'}
									size="sm"
								>
									New project
								</CreateProjectButton>
							)}
						</div>
					)}
			</DashboardContainer>
		</>
	);
}
