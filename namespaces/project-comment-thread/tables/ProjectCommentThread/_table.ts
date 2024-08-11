import type {
	logsValidator,
	networkLogEntryValidator,
} from '#validators/logs.ts';
import { type Infer, v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import { slackCommentMetadataValidator } from '@-/integrations/validators';
import {
	table,
	vDeprecated,
	vExcluded,
	virtual,
	virtualArray,
	vNew,
	vNullable,
	vVirtual,
	vVirtualArray,
} from 'corvex';

export const ProjectCommentThread = table(
	'ProjectCommentThread',
	v.object({
		organization: v.id('Organization'),
		project: v.id('Project'),

		slug: vNew(v.string()),

		// Excluded by default as XPaths can be large
		anchorElementXpath: vExcluded(vNullable(v.string())),
		xpathType: vNew(v.string()),
		linkedProjectLivePreview: vNullable(v.id('ProjectLivePreview')),
		percentageLeft: v.float64(),
		percentageTop: v.float64(),
		resolvedByUser: vNullable(v.id('User')),
		route: v.string(),
		updatedAt: v.number(),
		comments: vVirtualArray('ProjectComment'),

		gitMetadata_: vVirtual('ProjectCommentThreadGitMetadata', {
			nullable: true,
		}),
		windowMetadata_: vVirtual('ProjectCommentThreadWindowMetadata', {
			nullable: true,
		}),
		jiraIssueRelation: vVirtual('ProjectCommentThreadJiraIssueRelation', {
			nullable: true,
		}),
		linearIssueRelation: vVirtual('ProjectCommentThreadLinearIssueRelation', {
			nullable: true,
		}),
		slackMessageRelation: vVirtual('ProjectCommentThreadSlackMessageRelation', {
			nullable: true,
		}),
		asanaTaskRelation: vVirtual('ProjectCommentThreadAsanaTaskRelation', {
			nullable: true,
		}),
		slackMetadata: vNew(vNullable(slackCommentMetadataValidator)),

		consoleLogsFile: vVirtual('File', { nullable: true }),
		consoleLogEntriesCount: vNew(v.number()),
		networkLogEntriesFile: vVirtual('File', { nullable: true }),
		networkLogEntriesCount: vNew(v.number()),

		sessionEventsFile: vVirtual('File', {
			nullable: true,
		}),
		sessionEventsThumbnailFile: vVirtual('File', {
			nullable: true,
		}),
		/* deprecated properties */
		slackData: vDeprecated<unknown>('Use `slackMetadata` instead'),
		resolvedByProjectLivePreviewMember: vDeprecated<unknown>(
			'Use `resolvedByUser` instead',
		),
		createdJiraIssue: vDeprecated<unknown>('Use `jiraIssueRelation` instead'),
		createdLinearIssue: vDeprecated<unknown>(
			'Use `linearIssueRelation` instead',
		),
		createdSlackMessage: vDeprecated<unknown>(
			'Use `slackMessageRelation` instead',
		),
		gitMetadata: vDeprecated<unknown>('Use `gitMetadata_`'),
		windowMetadata: vDeprecated<unknown>('Use `windowMetadata_`'),
		logs: vDeprecated<Infer<typeof logsValidator> | null>(
			'Use `logsFile` instead',
		),
		networkLogEntries: vDeprecated<
			Array<Infer<typeof networkLogEntryValidator>> | null
		>('Use `networkLogEntriesFile` instead.'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_linkedProjectLivePreview', ['linkedProjectLivePreview'])
			.index('by_resolvedByUser', ['resolvedByUser'])
			.index('by_sessionEventsFile', ['sessionEventsFile'])
			.index('by_sessionEventsThumbnailFile', ['sessionEventsThumbnailFile'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_gitMetadata_', ['gitMetadata_'])
			.index('by_windowMetadata_', ['windowMetadata_']),
)({
	slug: {
		default: (doc) => doc.cid as any,
	},
	xpathType: {
		default: () => 'robula',
	},
	comments: virtualArray<typeof $.ProjectComment>(
		'ProjectComment',
		'by_parentCommentThread',
	),
	linkedProjectLivePreview: {
		foreignTable: 'ProjectLivePreview',
		hostIndex: 'by_linkedProjectLivePreview',
		onDelete: 'SetNull',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	resolvedByUser: {
		foreignTable: 'User',
		hostIndex: 'by_resolvedByUser',
		onDelete: 'SetNull',
	},
	sessionEventsFile: virtual<typeof $.File>(
		'File',
		'by_projectCommentThread',
	),
	sessionEventsThumbnailFile: virtual<typeof $.File>(
		'File',
		'by_projectCommentThreadSessionEventsThumbnail',
	),
	gitMetadata_: virtual<typeof $.ProjectCommentThreadGitMetadata>(
		'ProjectCommentThreadGitMetadata',
		'by_projectCommentThread',
	),
	windowMetadata_: virtual<typeof $.ProjectCommentThreadWindowMetadata>(
		'ProjectCommentThreadWindowMetadata',
		'by_projectCommentThread',
	),
	jiraIssueRelation: virtual<typeof $.ProjectCommentThreadJiraIssueRelation>(
		'ProjectCommentThreadJiraIssueRelation',
		'by_projectCommentThread',
	),
	linearIssueRelation: virtual<
		typeof $.ProjectCommentThreadLinearIssueRelation
	>('ProjectCommentThreadLinearIssueRelation', 'by_projectCommentThread'),
	slackMessageRelation: virtual<
		typeof $.ProjectCommentThreadSlackMessageRelation
	>('ProjectCommentThreadSlackMessageRelation', 'by_projectCommentThread'),
	asanaTaskRelation: virtual<typeof $.ProjectCommentThreadAsanaTaskRelation>(
		'ProjectCommentThreadAsanaTaskRelation',
		'by_projectCommentThread',
	),
	consoleLogsFile: virtual<
		typeof $.File
	>('File', 'by_projectCommentThreadConsoleLogs'),
	consoleLogEntriesCount: {
		default: (document) => document.logs?.consoleHistory.length ?? 0,
	},
	networkLogEntriesFile: virtual<
		typeof $.File
	>('File', 'by_projectCommentThreadNetworkLogEntries'),
	networkLogEntriesCount: {
		default: (document) => document.networkLogEntries?.length ?? 0,
	},
	slackMetadata: { default: () => null },
});
