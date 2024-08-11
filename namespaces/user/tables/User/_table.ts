import { callSettingsValidator } from '#validators/call-settings.ts';
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

export const User = table(
	'User',
	v.object({
		/**
			`workosUserId` is nullable so that we always call `User_ensureWorkosUser` when retrieving a the WorkOS User ID which ensures that the user actually exists in WorkOS
		*/
		workosUserId: vNew(vNullable(v.string())),
		username: v.string(),
		callSettings: callSettingsValidator,
		email: v.string(),
		fullName: v.string(),
		profileImageUrl: vNullable(v.string()),
		tokenIdentifier: vNew(vExcluded(v.string())),
		// sensitive
		apiKey: vExcluded(v.string()),
		files: vVirtualArray('File'),
		organizationMemberships: vVirtualArray('OrganizationMember'),
		receivedOrganizationInvitations: vVirtualArray('OrganizationInvitation'),
		/**
			Timezone might be null if we haven't gotten a chance to infer it from the user's browser yet. Whenever it's null, we should default to UTC time.
		*/
		timezone: vNew(vNullable(v.string())),
		githubAccount: vExcluded(vNew(vNullable(v.object({
			userId: v.number(),
			username: v.string(),
			accessToken: v.string(),
		})))),
		lastOpenedOrganization: vNew(vNullable(v.id('Organization'))),

		personalOrganization: vDeprecated<unknown>(
			'Personal organizations have been removed',
		),
		cid: vDeprecated<string>('Use `_id` instead'),
		clerkUserId: vDeprecated<string>('Use `workosUserId` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_clerkUserId', ['clerkUserId'])
			.index('by_username', ['username'])
			.index('by_email', ['email'])
			.index('by_apiKey', ['apiKey'])
			.index('by_githubAccountUserId', ['githubAccount.userId'])
			.index('by_lastOpenedOrganization', ['lastOpenedOrganization'])
			.index('by_tokenIdentifier', ['tokenIdentifier'])
			.index('by_workosUserId', ['workosUserId']),
)({
	githubAccount: { default: () => null },
	timezone: { default: () => null },
	files: virtualArray<typeof $.File>('File', 'by_user'),
	organizationMemberships: virtualArray<typeof $.OrganizationMember>(
		'OrganizationMember',
		'by_user',
	),
	receivedOrganizationInvitations: virtualArray<
		typeof $.OrganizationInvitation
	>('OrganizationInvitation', 'by_recipientUser'),
	tokenIdentifier: { default: () => '' },
	workosUserId: { default: () => null },
	lastOpenedOrganization: {
		default: () => null,
		onDelete: 'SetNull',
		foreignTable: 'Organization',
		hostIndex: 'by_lastOpenedOrganization',
	},
});
