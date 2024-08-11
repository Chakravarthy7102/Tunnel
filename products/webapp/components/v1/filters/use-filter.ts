'use client';

import { trpc } from '#utils/trpc.ts';
import type { CommentsContext } from '@-/comments';
import type { Id } from '@-/database';
import type {
	FiltersChoicesMap,
	ProjectCommentThreadFiltersSelection,
} from '@-/project-comment-thread';
import { emptyFiltersSelection } from '@-/project-comment-thread/constants';
import { useState } from 'react';

export const useFiltersSelection = ({
	commentsContext,
	organizationId,
	projectId,
}: {
	commentsContext: CommentsContext;
	organizationId: Id<'Organization'>;
	projectId: Id<'Project'> | null;
}) => {
	const [filtersSelection, setFiltersSelection] = useState<
		ProjectCommentThreadFiltersSelection
	>({ ...emptyFiltersSelection, oneOfStatus: ['unresolved'] });

	const { commentsState } = commentsContext;
	const { userActor } = commentsState;

	const { data: linearFiltersChoices } = trpc.projectLinearIssue
		.listFiltersChoices.useQuery({
			actor: userActor,
			...(projectId !== null ?
				{
					project: { id: projectId },
				} :
				{
					organization: {
						id: organizationId,
					},
				}),
		});

	const { data: jiraFiltersChoices } = trpc.projectJiraIssue.listFiltersChoices
		.useQuery({
			actor: userActor,
			...(projectId !== null ?
				{
					project: { id: projectId },
				} :
				{
					organization: {
						id: organizationId,
					},
				}),
		});

	const { data: projectCommentThreadFiltersChoices } = trpc.projectCommentThread
		.listFiltersChoices.useQuery({
			actor: userActor,
			...(projectId !== null ?
				{
					project: { id: projectId },
				} :
				{
					organization: {
						id: organizationId,
					},
				}),
		});

	const filtersChoicesMap: FiltersChoicesMap = {
		...linearFiltersChoices?.unwrapOr({}),
		...jiraFiltersChoices?.unwrapOr({}),
		...(projectCommentThreadFiltersChoices &&
				'value' in projectCommentThreadFiltersChoices ?
			projectCommentThreadFiltersChoices.value :
			{}),
		oneOfStatus: [
			{
				name: 'Resolved',
				value: 'resolved',
			},
			{
				name: 'Unresolved',
				value: 'unresolved',
			},
		],
	};

	const clearFiltersSelection = () => {
		setFiltersSelection({
			...emptyFiltersSelection,
			oneOfStatus: ['unresolved'],
		});
	};

	return {
		filtersChoicesMap,
		filtersSelection,
		setFiltersSelection,
		clearFiltersSelection,
	};
};
