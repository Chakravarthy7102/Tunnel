import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	table,
	vDeprecated,
	vExcluded,
	virtualArray,
	vNew,
	vNullable,
	vVirtualArray,
} from 'corvex';

export const ProjectComment = table(
	'ProjectComment',
	v.object({
		parentCommentThread: v.id('ProjectCommentThread'),

		/** This value should match `parentCommentThread.project`.  */
		project: v.id('Project'),
		/** This value should match `parentCommentThread.organization`.  */
		organization: v.id('Organization'),

		/**
			The author of the project comment. We use the `User` type here instead of `OrganizationMember` so that the author remains valid even if they are removed from the project.

			We make the `authorUser` nullable so that a user's comments aren't deleted when the user is deleted.
		*/
		authorUser: vNullable(v.id('User')),
		// Excluded by default as it might be large
		content: vExcluded(v.array(v.any())),
		// Excluded by default as it might be large
		contentTextContent: vExcluded(v.string()),
		updatedAt: v.number(),
		files: vVirtualArray('File'),
		// This handles the metadata from a message sent from tunnel -> slack
		slackMetadata: vNew(
			vNullable(v.object({
				messageTS: v.string(),
				userId: v.string(),
			})),
		),
		// This makes sure that slack -> tunnel messages don't trigger twice
		sentBySlack: vNew(v.boolean()),
		authorInformation: vNew(
			vNullable(
				v.object({
					displayName: v.string(),
					displayProfileImageUrl: v.string(),
				}),
			),
		),
		rawText: vDeprecated<unknown>('Use `content` instead'),
		authorProjectLivePreviewMember: vDeprecated<unknown>(
			'Use `authorUser` instead',
		),
		receivedBySlack: vDeprecated<unknown>(
			'Now check if there is a messageId in `slackMetadata`',
		),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_authorUser', ['authorUser'])
			.index('by_parentCommentThread', ['parentCommentThread'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_slackMessage', [
				'slackMetadata.messageTS',
				'slackMetadata.userId',
			])
			.searchIndex('search_contentTextContent', {
				searchField: 'contentTextContent',
				filterFields: ['project', 'organization'],
			}),
)({
	authorInformation: { default: () => null },
	slackMetadata: {
		default: () => null,
	},
	sentBySlack: {
		default: () => false,
	},
	authorUser: {
		foreignTable: 'User',
		hostIndex: 'by_authorUser',
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
	files: virtualArray<typeof $.File>('File', 'by_projectComment'),
	parentCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_parentCommentThread',
		onDelete: 'Cascade',
	},
});
