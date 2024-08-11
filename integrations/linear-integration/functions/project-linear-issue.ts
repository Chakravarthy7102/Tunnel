import { createLinearFilterChoicesMaps } from '#utils/filter.ts';
import {
	linearAssigneeValidator,
	linearPriorityValidator,
	linearProjectValidator,
	linearStatusValidator,
	linearTeamValidator,
} from '#validators/linear.ts';
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

export const ProjectLinearIssue_create = protectedMutation(
	'ProjectLinearIssue',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					organization: v.id('Organization'),
					team: linearTeamValidator,
					linearProject: vNullable(linearProjectValidator),
					priority: vNullable(linearPriorityValidator),
					status: vNullable(linearStatusValidator),
					assignee: vNullable(linearAssigneeValidator),
					identifier: v.string(),
					issueId: v.string(),
					issueUrl: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const _id = await dbInsert(ctx, 'ProjectLinearIssue', data, {
				unique: {},
			});
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the project linear issue', {
				cause: error,
			}),
	},
);

export const ProjectLinearIssue_get = protectedQuery(
	'ProjectLinearIssue',
	{
		args: {
			from: v.object({ id: v.id('ProjectLinearIssue') }),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(ctx, 'ProjectLinearIssue', from.id, include);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while retrieving the project linear issue', {
				cause: error,
			}),
	},
);

export const ProjectLinearIssue_listFiltersChoices = protectedQuery(
	'ProjectLinearIssue',
	{
		args: {
			input: v.union(
				v.object({ organization: v.id('Organization') }),
				v.object({ project: v.id('Project') }),
			),
		},
		async handler(ctx, { input }) {
			const projectLinearIssues = await (async () => {
				switch (true) {
					case 'organization' in input: {
						return ctx.db
							.query('ProjectLinearIssue')
							.withIndex(
								'by_organization',
								(q) => q.eq('organization', input.organization),
							)
							.collect();
					}

					case 'project' in input: {
						return ctx.db
							.query('ProjectLinearIssue')
							.withIndex('by_project', (q) => q.eq('project', input.project))
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

			const choicesMaps = createLinearFilterChoicesMaps();

			for (const projectLinearIssue of projectLinearIssues) {
				for (const value of Object.values(projectLinearIssue)) {
					if (value === null || Array.isArray(value)) {
						continue;
					}

					const linearIssuePropertiesToChoiceKeys = {
						oneOfLinearIssueAssigneeIds() {
							if (projectLinearIssue.assignee) {
								this.setElement(projectLinearIssue.assignee.id, {
									name: projectLinearIssue.assignee.name,
									value: projectLinearIssue.assignee.id,
								});
							}
						},
						oneOfLinearIssueIdentifiers() {
							if (projectLinearIssue.identifier) {
								this.setElement(projectLinearIssue.identifier, {
									name: projectLinearIssue.identifier,
									value: projectLinearIssue.identifier,
								});
							}
						},
						oneOfLinearIssuePriorityLabels() {
							if (projectLinearIssue.priority) {
								this.setElement(String(projectLinearIssue.priority.priority), {
									name: projectLinearIssue.priority.label,
									value: String(projectLinearIssue.priority.priority),
								});
							}
						},
						oneOfLinearIssueProjectIds() {
							if (projectLinearIssue.linearProject) {
								this.setElement(projectLinearIssue.linearProject.id, {
									name: projectLinearIssue.linearProject.name,
									value: projectLinearIssue.linearProject.id,
								});
							}
						},
						oneOfLinearIssueStatusIds() {
							if (projectLinearIssue.status) {
								this.setElement(projectLinearIssue.status.id, {
									name: projectLinearIssue.status.name,
									value: projectLinearIssue.status.id,
								});
							}
						},
						oneOfLinearIssueTeamIds() {
							if (projectLinearIssue.team) {
								this.setElement(projectLinearIssue.team.id, {
									name: projectLinearIssue.team.name,
									value: projectLinearIssue.team.id,
								});
							}
						},
					} satisfies Record<
						Exclude<keyof typeof choicesMaps, 'allOfLinearIssueLabelIds'>,
						(this: OrderedMap<string, { name: string; value: string }>) => void
					>;

					for (
						const [choiceKey, choiceCallback] of Object.entries(
							linearIssuePropertiesToChoiceKeys,
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
				throw new Error('Project not found');
			}

			const projectLinearIssueLabels = await ctx.db
				.query('ProjectLinearIssueLabel')
				.withIndex(
					'by_organization',
					(q) => q.eq('organization', organizationId),
				)
				.collect();

			for (const projectLinearIssueLabel of projectLinearIssueLabels) {
				choicesMaps.allOfLinearIssueLabelIds.setElement(
					projectLinearIssueLabel.labelId,
					{
						name: projectLinearIssueLabel.name,
						value: projectLinearIssueLabel.labelId,
					},
				);
			}

			return mapObject(choicesMaps, (key, valuesMap) => [
				key,
				[...valuesMap].map(([_valueId, value]) => value),
			]) satisfies {
				[$FilterKey in FilterKey]?: NormalizedFilterChoice[];
			};
		},
		error: (error) =>
			new UnexpectedError('while listing filters', { cause: error }),
	},
);
