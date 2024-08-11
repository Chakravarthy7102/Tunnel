import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	asanaSettingsValidator,
	githubRepositoryValidator,
	jiraSettingsValidator,
	linearSettingsValidator,
	slackChannelValidator,
} from '@-/integrations/validators';
import {
	table,
	vDeprecated,
	virtual,
	virtualArray,
	vNew,
	vNullable,
	vVirtual,
	vVirtualArray,
} from 'corvex';

export const Project = table(
	'Project',
	v.object({
		name: v.string(),
		slug: vNew(v.string()),
		/**
			When we generate the user's project for the first time, we set their project name to "Unnamed Project" and then try to auto-infer it from their application's `document.title`. However, we want to distinguish the case where the user actually wants to name their project "Unnamed Project", so we use this boolean flag to tell.
		*/
		isUnnamed: vNew(v.boolean()),
		isSessionRecordingEnabled: vNew(v.boolean()),
		isAutoScreenshotEnabled: vNew(v.boolean()),
		organization: v.id('Organization'),
		updatedAt: v.number(),
		githubRepository: vNullable(githubRepositoryValidator),
		commentThreads: vVirtualArray('ProjectCommentThread'),
		livePreviews: vVirtualArray('ProjectLivePreview'),
		githubPullRequestRelations: vVirtualArray('GithubPullRequestRelation'),
		gitlabMergeRequestRelations: vVirtualArray('GitlabMergeRequestRelation'),
		slackChannel: vNew(vNullable(slackChannelValidator)),
		tunnelInstanceProxyPreviews: vVirtualArray('TunnelInstanceProxyPreview'),
		asanaSettings: vNew(vNullable(asanaSettingsValidator)),
		jiraSettings: vNew(vNullable(jiraSettingsValidator)),
		linearSettings: vNew(vNullable(linearSettingsValidator)),
		shouldLinkGithubRepository: vNew(vNullable(v.boolean())),
		gitlabProject: vVirtual('ProjectGitlabProject', {
			nullable: true,
		}),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organization', ['organization'])
			.index('by_githubRepositoryId', ['githubRepository.id'])
			.index('by_slug', ['slug']),
)({
	slug: {
		default: (doc) => doc.cid as any,
	},
	isUnnamed: { default: () => false },
	asanaSettings: { default: () => null },
	jiraSettings: { default: () => null },
	linearSettings: { default: () => null },
	isSessionRecordingEnabled: { default: () => false },
	isAutoScreenshotEnabled: { default: () => true },
	slackChannel: { default: () => null },
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	commentThreads: virtualArray<typeof $.ProjectCommentThread>(
		'ProjectCommentThread',
		'by_project',
	),
	livePreviews: virtualArray<typeof $.ProjectLivePreview>(
		'ProjectLivePreview',
		'by_project',
	),
	githubPullRequestRelations: virtualArray<typeof $.GithubPullRequestRelation>(
		'GithubPullRequestRelation',
		'by_project',
	),
	gitlabMergeRequestRelations: virtualArray<
		typeof $.GitlabMergeRequestRelation
	>(
		'GitlabMergeRequestRelation',
		'by_project',
	),
	gitlabProject: virtual<
		typeof $.ProjectGitlabProject
	>('ProjectGitlabProject', 'by_project'),
	tunnelInstanceProxyPreviews: virtualArray<
		typeof $.TunnelInstanceProxyPreview
	>('TunnelInstanceProxyPreview', 'by_project'),
	shouldLinkGithubRepository: {
		default: () => null,
	},
});
