import { v } from '@-/convex/values';
import { table } from 'corvex';

export const ProjectGitlabProject = table(
	'ProjectGitlabProject',
	v.object({
		project: v.id('Project'),

		// GitLab project information
		gitlabProjectId: v.number(),
		gitlabProjectName: v.string(),

		// GitLab project hook id
		gitlabProjectHookId: v.number(),
	}),
	(t) =>
		t
			.index('by_project', ['project'])
			.index('by_gitlabProjectId', ['gitlabProjectId'])
			.index('by_gitlabProjectHookId', ['gitlabProjectHookId']),
)({
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
});
