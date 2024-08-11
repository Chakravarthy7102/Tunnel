import type { ProjectCommentThreadFiltersSelection } from '#types';
import type { FilterBuilder } from '@-/convex/server';
import type { DataModel, Doc, Id, QueryCtx } from '@-/database';
import { objectKeys, unreachableCase } from '@tunnel/ts';
import intersect from 'fast_array_intersect';

async function getProjectCommentThreadIdsFromProjectJiraIssues(
	ctx: QueryCtx,
	projectJiraIssues: Doc<'ProjectJiraIssue'>[],
): Promise<Id<'ProjectCommentThread'>[]> {
	const projectCommentThreadJiraIssueRelations = await Promise.all(
		projectJiraIssues.map(async (projectJiraIssue) =>
			ctx.db
				.query('ProjectCommentThreadJiraIssueRelation')
				.withIndex('by_projectJiraIssue', (q) =>
					q.eq('projectJiraIssue', projectJiraIssue._id))
				.first()
		),
	);

	return projectCommentThreadJiraIssueRelations
		.filter(
			(relation): relation is Doc<'ProjectCommentThreadJiraIssueRelation'> =>
				relation !== null,
		)
		.map(({ projectCommentThread }) => projectCommentThread);
}

async function getProjectCommentThreadIdsFromProjectLinearIssues(
	ctx: QueryCtx,
	projectLinearIssues: Doc<'ProjectLinearIssue'>[],
): Promise<Id<'ProjectCommentThread'>[]> {
	const projectCommentThreadLinearIssueRelations = await Promise.all(
		projectLinearIssues.map(async (projectLinearIssue) =>
			ctx.db
				.query('ProjectCommentThreadLinearIssueRelation')
				.withIndex(
					'by_projectLinearIssue',
					(q) => q.eq('projectLinearIssue', projectLinearIssue._id),
				)
				.first()
		),
	);

	return projectCommentThreadLinearIssueRelations
		.filter(
			(relation): relation is Doc<'ProjectCommentThreadLinearIssueRelation'> =>
				relation !== null,
		)
		.map(({ projectCommentThread }) => projectCommentThread);
}

const filterHandlers = {
	// Linear issue filters
	async oneOfLinearIssueTeamIds(ctx, teamIds) {
		const projectLinearIssues = (await Promise.all(
			teamIds.map(async (teamId) =>
				ctx.db
					.query('ProjectLinearIssue')
					.withIndex('by_teamId', (q) => q.eq('team.id', teamId ?? undefined))
					.collect()
			),
		)).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async oneOfLinearIssueProjectIds(ctx, linearProjectIds) {
		const projectLinearIssues = (
			await Promise.all(
				linearProjectIds.map(async (linearProjectId) =>
					ctx.db
						.query('ProjectLinearIssue')
						.withIndex('by_linearProjectId', (q) =>
							q.eq('linearProject.id', linearProjectId ?? undefined))
						.collect()
				),
			)
		).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async oneOfLinearIssuePriorityLabels(ctx, priorityLabels, resource) {
		// TODO
		if ('organizationMember' in resource) {
			return [];
		}

		if ('linkedProjectLivePreview' in resource) {
			const linkedProjectLivePreview = await ctx.db.get(
				resource.linkedProjectLivePreview,
			);

			if (linkedProjectLivePreview === null) {
				return [];
			}

			const projectLinearIssues = (
				await Promise.all(
					priorityLabels.map(async (priorityLabel) =>
						ctx.db
							.query('ProjectLinearIssue')
							.withIndex('by_project_priorityLabel', (q) =>
								q
									.eq('project', linkedProjectLivePreview.project)
									.eq('priority.label', priorityLabel ?? undefined))
							.collect()
					),
				)
			).flat();

			return getProjectCommentThreadIdsFromProjectLinearIssues(
				ctx,
				projectLinearIssues,
			);
		}

		const projectLinearIssues = (
			await Promise.all(
				priorityLabels.map(async (priorityLabel) =>
					'project' in resource ?
						ctx.db
							.query('ProjectLinearIssue')
							.withIndex('by_project_priorityLabel', (q) =>
								q
									.eq('project', resource.project)
									.eq('priority.label', priorityLabel ?? undefined))
							.collect() :
						ctx.db
							.query('ProjectLinearIssue')
							.withIndex('by_organization_priorityLabel', (q) =>
								q
									.eq('organization', resource.organization)
									.eq('priority.label', priorityLabel ?? undefined))
							.collect()
				),
			)
		).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async oneOfLinearIssueStatusIds(ctx, statusIds) {
		const projectLinearIssues = (
			await Promise.all(
				statusIds.map(async (statusId) =>
					ctx.db
						.query('ProjectLinearIssue')
						.withIndex('by_statusId', (q) =>
							q.eq('status.id', statusId ?? undefined))
						.collect()
				),
			)
		).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async oneOfLinearIssueAssigneeIds(ctx, assigneeIds) {
		const projectLinearIssues = (
			await Promise.all(
				assigneeIds.map(async (assigneeId) =>
					ctx.db
						.query('ProjectLinearIssue')
						.withIndex('by_assigneeId', (q) =>
							q.eq('assignee.id', assigneeId ?? undefined))
						.collect()
				),
			)
		).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async oneOfLinearIssueIdentifiers(ctx, identifiers) {
		const projectLinearIssues = (
			await Promise.all(
				identifiers.map(async (identifier) =>
					ctx.db
						.query('ProjectLinearIssue')
						.withIndex('by_identifier', (q) => q.eq('identifier', identifier))
						.collect()
				),
			)
		).flat();

		return getProjectCommentThreadIdsFromProjectLinearIssues(
			ctx,
			projectLinearIssues,
		);
	},
	async allOfLinearIssueLabelIds(ctx, labelIds) {
		const projectLinearIssueIdsSet = new Set<Id<'ProjectLinearIssue'>>();

		await Promise.all(
			labelIds.map(async (labelId) => {
				const projectLinearIssueLabels = await ctx.db
					.query('ProjectLinearIssueLabel')
					.withIndex('by_labelId', (q) => q.eq('labelId', labelId))
					.collect();

				for (const { projectLinearIssue } of projectLinearIssueLabels) {
					projectLinearIssueIdsSet.add(projectLinearIssue);
				}
			}),
		);

		const projectCommentThreadIds = (
			await Promise.all(
				[...projectLinearIssueIdsSet].map(async (projectLinearIssueId) =>
					ctx.db
						.query('ProjectCommentThreadLinearIssueRelation')
						.withIndex('by_projectLinearIssue', (q) =>
							q.eq('projectLinearIssue', projectLinearIssueId))
						.first()
				),
			)
		)
			.filter((
				relation,
			): relation is Doc<'ProjectCommentThreadLinearIssueRelation'> =>
				relation !== null
			)
			.map(({ projectCommentThread }) => projectCommentThread);

		return projectCommentThreadIds;
	},
	// Jira issue
	async oneOfJiraIssueKeys(ctx, keys) {
		const projectJiraIssues = (
			await Promise.all(keys.map(async (key) =>
				ctx.db
					.query('ProjectJiraIssue')
					.withIndex('by_key', (q) => q.eq('key', key))
					.collect()
			))
		).flat();

		return getProjectCommentThreadIdsFromProjectJiraIssues(
			ctx,
			projectJiraIssues,
		);
	},
	async oneOfJiraIssueProjectIds(ctx, jiraProjectIds) {
		const projectJiraIssues = (
			await Promise.all(jiraProjectIds.map(async (projectId) =>
				ctx.db
					.query('ProjectJiraIssue')
					.withIndex('by_jiraProjectId', (q) =>
						q.eq('jiraProject.id', projectId ?? undefined))
					.collect()
			))
		).flat();

		return getProjectCommentThreadIdsFromProjectJiraIssues(
			ctx,
			projectJiraIssues,
		);
	},
	async oneOfJiraIssueTypeIds(ctx, issueTypeIds) {
		const projectJiraIssues = (
			await Promise.all(issueTypeIds.map(async (issueTypeId) =>
				ctx.db
					.query('ProjectJiraIssue')
					.withIndex('by_issueTypeId', (q) =>
						q.eq('issueType.id', issueTypeId ?? undefined))
					.collect()
			))
		).flat();

		return getProjectCommentThreadIdsFromProjectJiraIssues(
			ctx,
			projectJiraIssues,
		);
	},
	async oneOfJiraIssueAssigneeAccountIds(ctx, assigneeAccountIds) {
		const projectJiraIssues = (
			await Promise.all(assigneeAccountIds.map(async (accountId) =>
				ctx.db
					.query('ProjectJiraIssue')
					.withIndex('by_assigneeAccountId', (q) =>
						q.eq('assignee.accountId', accountId ?? undefined))
					.collect()
			))
		).flat();

		return getProjectCommentThreadIdsFromProjectJiraIssues(
			ctx,
			projectJiraIssues,
		);
	},
	async allOfJiraLabels(ctx, labelNames) {
		const projectJiraIssueIdsSet = new Set<Id<'ProjectJiraIssue'>>();

		await Promise.all(
			labelNames.map(async (labelName) => {
				const projectJiraIssueLabels = await ctx.db
					.query('ProjectJiraIssueLabel')
					.withIndex('by_name', (q) => q.eq('name', labelName))
					.collect();

				for (const { projectJiraIssue } of projectJiraIssueLabels) {
					projectJiraIssueIdsSet.add(projectJiraIssue);
				}
			}),
		);

		const projectCommentThreadIds = (
			await Promise.all(
				[...projectJiraIssueIdsSet].map(async (projectJiraIssueId) =>
					ctx.db
						.query('ProjectCommentThreadJiraIssueRelation')
						.withIndex('by_projectJiraIssue', (q) =>
							q.eq('projectJiraIssue', projectJiraIssueId))
						.first()
				),
			)
		)
			.filter(
				(relation): relation is Doc<'ProjectCommentThreadJiraIssueRelation'> =>
					relation !== null,
			)
			.map(({ projectCommentThread }) => projectCommentThread);

		return projectCommentThreadIds;
	},
	async oneOfAuthorUserIds(ctx, authorUserIds) {
		const projectComments = (
			await Promise.all(
				authorUserIds.map(async (authorUserId) =>
					ctx.db
						.query('ProjectComment')
						.withIndex('by_authorUser', (q) =>
							q.eq('authorUser', authorUserId as Id<'User'>))
						.collect()
				),
			)
		).flat();

		return projectComments.map(
			({ parentCommentThread }) => parentCommentThread,
		);
	},
	async oneOfProjectIds(ctx, projectIds) {
		const projectCommentThreads = (
			await Promise.all(
				projectIds.map(async (projectId) =>
					ctx.db
						.query('ProjectCommentThread')
						.withIndex('by_project', (q) =>
							q.eq('project', projectId as Id<'Project'>))
						.collect()
				),
			)
		).flat();

		return projectCommentThreads.map(({ _id }) => _id);
	},
} satisfies {
	[
		$FilterSelection in keyof Omit<
			ProjectCommentThreadFiltersSelection,
			'oneOfStatus'
		>
	]: (
		ctx: QueryCtx,
		values: ProjectCommentThreadFiltersSelection[$FilterSelection],
		resource:
			| { organization: Id<'Organization'> }
			| { project: Id<'Project'> }
			| { linkedProjectLivePreview: Id<'ProjectLivePreview'> }
			| { organizationMember: Id<'OrganizationMember'> },
	) => Promise<Id<'ProjectCommentThread'>[]>;
};

export async function buildFilteredProjectCommentThreadsFilterExpression(
	ctx: QueryCtx,
	args:
		& (
			| { organization: Id<'Organization'> }
			| { project: Id<'Project'> }
			| { linkedProjectLivePreview: Id<'ProjectLivePreview'> }
			| { organizationMember: Id<'OrganizationMember'> }
		)
		& {
			filtersSelection: ProjectCommentThreadFiltersSelection;
		},
): Promise<
	(
		q: FilterBuilder<DataModel['ProjectCommentThread']>,
	) => any
> {
	if (Object.keys(args.filtersSelection).length === 0) {
		throw new Error('Filters must have at least one key');
	}

	const projectCommentThreadIdArraysToIntersect: Array<
		Id<'ProjectCommentThread'>[]
	> = [];
	let hasEmptyIntersectArray = false;

	for (
		const filterKey of objectKeys(
			args.filtersSelection as Omit<
				typeof args.filtersSelection,
				'oneOfStatus'
			>,
		)
	) {
		// @ts-expect-error: We handle this case specially
		if (filterKey === 'oneOfStatus') {
			continue;
		}

		const filterSelection = args.filtersSelection[filterKey];
		if (filterSelection.length === 0) {
			continue;
		}

		// eslint-disable-next-line no-await-in-loop -- TODO
		const projectCommentThreadIds = await filterHandlers[filterKey](
			ctx,
			// @ts-expect-error: todo
			filterSelection,
			'organization' in args ?
				{ organization: args.organization } :
				'project' in args ?
				{ project: args.project } :
				'linkedProjectLivePreview' in args ?
				{ linkedProjectLivePreview: args.linkedProjectLivePreview } :
				{ organizationMember: args.organizationMember },
		);

		if (projectCommentThreadIds.length === 0) {
			hasEmptyIntersectArray = true;
			break;
		}

		projectCommentThreadIdArraysToIntersect.push(projectCommentThreadIds);
	}

	if (hasEmptyIntersectArray) {
		return (q) => q.eq(false, true);
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
	const projectCommentThreadIds = (intersect.default ?? intersect)(
		projectCommentThreadIdArraysToIntersect,
	);

	const projectCommentThreadsFilterExpression = (
		q: FilterBuilder<DataModel['ProjectCommentThread']>,
	) => {
		const andQueries = [];
		if (
			args.filtersSelection.oneOfStatus.length === 1 &&
			args.filtersSelection.oneOfStatus[0] !== undefined
		) {
			andQueries.push(
				args.filtersSelection.oneOfStatus[0] === 'resolved' ?
					q.neq(q.field('resolvedByUser'), null) :
					q.eq(q.field('resolvedByUser'), null),
			);
		}

		if (projectCommentThreadIds.length > 0) {
			andQueries.push(
				q.or(
					...projectCommentThreadIds.map(
						(projectCommentThreadId) =>
							q.eq(q.field('_id'), projectCommentThreadId),
					),
				),
			);
		}

		return q.and(...andQueries);
	};

	switch (true) {
		case 'organization' in args: {
			return (q) =>
				q.and(
					q.eq(q.field('organization'), args.organization),
					projectCommentThreadsFilterExpression(q),
				);
		}

		case 'project' in args: {
			return (q) =>
				q.and(
					q.eq(q.field('project'), args.project),
					projectCommentThreadsFilterExpression(q),
				);
		}

		case 'linkedProjectLivePreview' in args: {
			return (q) =>
				q.and(
					q.eq(
						q.field('linkedProjectLivePreview'),
						args.linkedProjectLivePreview,
					),
					projectCommentThreadsFilterExpression(q),
				);
		}

		case 'organizationMember' in args: {
			const authorizedProjectIds = [
				...new Set((await ctx.db
					.query('OrganizationMemberAuthorizedProjectRelation')
					.withIndex(
						'by_organizationMember',
						(q) => q.eq('organizationMember', args.organizationMember),
					)
					.collect()).map(({ project }) => project)),
			];

			return (q) =>
				q.and(
					...authorizedProjectIds.map((projectId) =>
						q.eq(q.field('project'), projectId)
					),
					projectCommentThreadsFilterExpression(q),
				);
		}

		default: {
			return unreachableCase(args);
		}
	}
}
