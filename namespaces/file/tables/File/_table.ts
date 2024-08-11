import { v } from '@-/convex/values';
import { table, vDeprecated, vNew, vNullable } from 'corvex';

export const File = table(
	'File',
	v.object({
		filepath: v.string(),
		md5Hash: v.string(),
		projectComment: vNullable(v.id('ProjectComment')),
		// TODO: Rename to `projectCommentThreadAttachment`
		projectCommentThread: vNew(vNullable(v.id('ProjectCommentThread'))),
		projectCommentThreadSessionEventsThumbnail: vNew(
			vNullable(v.id('ProjectCommentThread')),
		),
		projectCommentThreadConsoleLogs: vNew(
			vNullable(v.id('ProjectCommentThread')),
		),
		projectCommentThreadNetworkLogEntries: vNew(
			vNullable(v.id('ProjectCommentThread')),
		),
		type: vNew(v.string()),
		user: vNullable(v.id('User')),
		storageId: vNew(vNullable(v.string())),

		s3Url: vDeprecated<string>(`Use \`storageId\` instead`),
		cid: vDeprecated<string>('Use `_id` instead'),
		tunnelInstanceEvergreenPreview: vDeprecated<string>('Not a thing anymore'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectComment', ['projectComment'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_projectCommentThreadSessionEventsThumbnail', [
				'projectCommentThreadSessionEventsThumbnail',
			])
			.index('by_projectCommentThreadConsoleLogs', [
				'projectCommentThreadConsoleLogs',
			])
			.index('by_projectCommentThreadNetworkLogEntries', [
				'projectCommentThreadNetworkLogEntries',
			])
			.index('by_user', ['user'])
			.index('by_type', ['type']),
)({
	type: { default: () => 'image/png' },
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'SetNull',
		default: () => null,
	},
	projectCommentThreadSessionEventsThumbnail: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThreadSessionEventsThumbnail',
		onDelete: 'SetNull',
		default: () => null,
	},
	projectComment: {
		foreignTable: 'ProjectComment',
		hostIndex: 'by_projectComment',
		onDelete: 'SetNull',
	},
	user: {
		foreignTable: 'User',
		hostIndex: 'by_user',
		onDelete: 'SetNull',
	},
	projectCommentThreadConsoleLogs: {
		default: () => null,
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThreadConsoleLogs',
		onDelete: 'SetNull',
	},
	projectCommentThreadNetworkLogEntries: {
		default: () => null,
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThreadNetworkLogEntries',
		onDelete: 'SetNull',
	},
	storageId: {
		default: () => null,
	},
});
