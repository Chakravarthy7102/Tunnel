import { createJiraFilterChoicesMaps } from '#utils/filter.ts';
import {
	jiraAssigneeValidator,
	jiraIssueTypeValidator,
	jiraParentIssueValidator,
	jiraProjectValidator,
} from '#validators/jira.ts';
import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import type {
	FilterKey,
	NormalizedFilterChoice,
} from '@-/project-comment-thread';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';
import type { OrderedMap } from 'js-sdsl';
import mapObject from 'map-obj';

export const ProjectJiraIssue_create = protectedMutation(
	'ProjectJiraIssue',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					organization: v.id('Organization'),
					issueId: v.string(),
					key: v.string(),
					self: v.string(),
					url: v.string(),
					jiraProject: jiraProjectValidator,
					assignee: vNullable(jiraAssigneeValidator),
					issueType: vNullable(jiraIssueTypeValidator),
					parentIssue: vNullable(jiraParentIssueValidator),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const _id = await dbInsert(ctx, 'ProjectJiraIssue', data, { unique: {} });
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the jira issue', { cause: error }),
	},
);

export const ProjectJiraIssue_get = protectedQuery(
	'ProjectJiraIssue',
	{
		args: {
			from: v.object({ id: v.id('ProjectJiraIssue') }),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(ctx, 'ProjectJiraIssue', from.id, include);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while getting the jira issue', { cause: error }),
	},
);

export const ProjectJiraIssue_listFiltersChoices = protectedQuery(
	'ProjectJiraIssue',
	{
		args: {
			input: v.union(
				v.object({ organization: v.id('Organization') }),
				v.object({ project: v.id('Project') }),
			),
		},
		async handler(ctx, { input }) {
			const projectJiraIssues = await (async () => {
				switch (true) {
					case 'organization' in input: {
						return ctx.db
							.query('ProjectJiraIssue')
							.withIndex(
								'by_organization',
								(q) => q.eq('organization', input.organization),
							)
							.collect();
					}

					case 'project' in input: {
						return ctx.db
							.query('ProjectJiraIssue')
							.withIndex(
								'by_project',
								(q) => q.eq('project', input.project),
							)
							.collect();
					}

					default: {
						return unreachableCase(
							input,
							`Invalid input: ${JSON.stringify(input)}`,
						);
					}
				}
			})();

			const choicesMaps = createJiraFilterChoicesMaps();

			for (const projectJiraIssue of projectJiraIssues) {
				for (const value of Object.values(projectJiraIssue)) {
					if (value === null || Array.isArray(value)) {
						continue;
					}

					const jiraIssuePropertiesToChoiceKeys = {
						oneOfJiraIssueAssigneeAccountIds() {
							if (projectJiraIssue.assignee) {
								this.setElement(projectJiraIssue.assignee.accountId, {
									name: projectJiraIssue.assignee.displayName,
									value: projectJiraIssue.assignee.accountId,
								});
							}
						},
						oneOfJiraIssueKeys() {
							if (projectJiraIssue.key) {
								this.setElement(projectJiraIssue.key, {
									name: projectJiraIssue.key,
									value: projectJiraIssue.key,
								});
							}
						},
						oneOfJiraIssueTypeIds() {
							if (projectJiraIssue.issueType) {
								this.setElement(projectJiraIssue.issueType.id, {
									name: projectJiraIssue.issueType.name,
									value: projectJiraIssue.issueType.id,
								});
							}
						},
						oneOfJiraIssueProjectIds() {
							if (projectJiraIssue.jiraProject) {
								this.setElement(projectJiraIssue.jiraProject.id, {
									name: projectJiraIssue.jiraProject.name,
									value: projectJiraIssue.jiraProject.id,
								});
							}
						},
					} satisfies Record<
						Exclude<keyof typeof choicesMaps, 'allOfJiraLabels'>,
						(this: OrderedMap<string, { name: string; value: string }>) => void
					>;

					for (
						const [choiceKey, choiceCallback] of Object.entries(
							jiraIssuePropertiesToChoiceKeys,
						)
					) {
						choiceCallback.call(
							choicesMaps[choiceKey as keyof typeof choicesMaps],
						);
					}
				}
			}

			const organizationId = 'project' in input ?
				(await ctx.db.get(input.project))?.organization :
				input.organization;

			if (!organizationId) {
				throw new Error('Organization not found');
			}

			const projectJiraIssueLabels = await ctx.db
				.query('ProjectJiraIssueLabel')
				.withIndex(
					'by_organization',
					(q) => q.eq('organization', organizationId),
				)
				.collect();

			for (const projectJiraIssueLabel of projectJiraIssueLabels) {
				choicesMaps.allOfJiraLabels.setElement(projectJiraIssueLabel.name, {
					value: projectJiraIssueLabel.name,
					name: projectJiraIssueLabel.name,
				});
			}

			return mapObject(choicesMaps, (key, valuesMap) => [
				key,
				[...valuesMap].map(([_valueId, value]) => {
					return value;
				}),
			]) satisfies {
				[$Key in FilterKey]?: NormalizedFilterChoice[];
			};
		},
		error: (error) =>
			new UnexpectedError('while listing jira filters', { cause: error }),
	},
);
