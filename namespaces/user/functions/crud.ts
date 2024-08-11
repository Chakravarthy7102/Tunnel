import { callSettingsValidator } from '#validators/call-settings.ts';
import { v } from '@-/convex/values';
import { createCid } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineGetHandler,
	protectedGetQuery,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { User_$profileData } from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { logger } from '@-/logger';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const User__create = protectedMutation(
	'User',
	{
		args: {
			input: v.object({
				data: v.object({
					workosUserId: vNullable(v.string()),
					username: v.string(),
					fullName: v.string(),
					email: v.string(),
					profileImageUrl: vNullable(v.string()),
					callSettings: callSettingsValidator,
					apiKey: v.string(),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(ctx, 'User', {
				...data,
				githubAccount: null,
				timezone: null,
				tokenIdentifier: '',
				lastOpenedOrganization: null,
			}, {
				unique: {
					by_username: ['username'],
					by_email: ['email'],
					by_apiKey: ['apiKey'],
				},
			});
			return applyInclude(ctx, 'User', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the user', { cause: error }),
	},
);

const getHandler = defineGetHandler(
	'User',
	{
		from: v.union(
			v.object({ id: v.id('User') }),
			v.object({ id: v.string() }),
			v.object({ workosUserId: v.string() }),
			v.object({ username: v.string() }),
			v.object({ email: v.string() }),
			v.object({ apiKey: v.string() }),
			v.object({ githubAccountUserId: v.number() }),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return ctx.db.normalizeId('User', from.id);
			}

			case 'workosUserId' in from: {
				return ctx.db
					.query('User')
					.withIndex(
						'by_workosUserId',
						(q) => q.eq('workosUserId', from.workosUserId),
					)
					.first();
			}

			case 'username' in from: {
				return ctx.db
					.query('User')
					.withIndex('by_username', (q) => q.eq('username', from.username))
					.first();
			}

			case 'email' in from: {
				return ctx.db
					.query('User')
					.withIndex('by_email', (q) => q.eq('email', from.email))
					.first();
			}

			case 'apiKey' in from: {
				return ctx.db
					.query('User')
					.withIndex('by_apiKey', (q) => q.eq('apiKey', from.apiKey))
					.first();
			}

			case 'githubAccountUserId' in from: {
				return ctx.db
					.query('User')
					.withIndex(
						'by_githubAccountUserId',
						(q) => q.eq('githubAccount.userId', from.githubAccountUserId),
					)
					.first();
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) => new UnexpectedError('while retrieving the user', { cause: error }),
);

export const User_get = protectedGetQuery(getHandler);
export const User_get_profileData = protectedGetQuery(
	getHandler,
	User_$profileData,
);

/**
	If the user doesn't have any associated live preview users, it means they haven't yet created a live preview
*/
export const User_hasCreatedProjectLivePreview = protectedQuery(
	'User',
	{
		args: {
			id: v.id('User'),
		},
		async handler(ctx, { id }) {
			const projectLivePreview = await ctx.db
				.query('ProjectLivePreview')
				.withIndex('by_createdByUser', (q) => q.eq('createdByUser', id))
				.first();

			return projectLivePreview !== null;
		},
		error: (error) =>
			new UnexpectedError(
				'while checking if the user has created a live preview',
				{ cause: error },
			),
	},
);

export const User_hasCreatedProject = protectedQuery(
	'User',
	{
		args: {
			id: v.id('User'),
		},
		async handler(ctx, { id }) {
			const organizationMembers = await ctx.db.query('OrganizationMember')
				.withIndex(
					'by_user',
					(q) => q.eq('user', id),
				).collect();

			const projects = await Promise.all(
				organizationMembers.flatMap(async (organizationMember) => {
					return ctx.db.query('Project').withIndex(
						'by_organization',
						(q) => q.eq('organization', organizationMember.organization),
					).collect();
				}),
			);

			return projects.length > 0;
		},
		error: (error) =>
			new UnexpectedError(
				'while checking if the user has created a project',
				{ cause: error },
			),
	},
);

export const User__ensureFromWorkosUser = protectedMutation(
	'User',
	{
		args: {
			input: v.object({
				workosUser: v.object({
					id: v.string(),
					email: v.string(),
					firstName: vNullable(v.string()),
					lastName: vNullable(v.string()),
					profilePictureUrl: vNullable(v.string()),
				}),
			}),
		},
		async handler(ctx, { input: { workosUser } }) {
			const user = await ctx.db.query('User').withIndex(
				'by_workosUserId',
				(q) => q.eq('workosUserId', workosUser.id),
			).first();

			if (user !== null) {
				return user._id;
			}

			// Try checking if the user exists by email
			const userByEmail = await ctx.db.query('User').withIndex(
				'by_email',
				(q) => q.eq('email', workosUser.email),
			).first();

			if (userByEmail !== null) {
				await ctx.db.patch(userByEmail._id, {
					workosUserId: workosUser.id,
				});

				return userByEmail._id;
			}

			logger.debug(
				`Creating new user with email = ${workosUser.email} and WorkOS User ID = ${workosUser.id}`,
			);
			// If the WorkOS user doesn't yet exist in our database, we should create a new user
			const newUserId = await dbInsert(
				ctx,
				'User',
				{
					apiKey: createCid(),
					githubAccount: null,
					timezone: null,
					tokenIdentifier: '',
					callSettings: {
						microphoneDeviceId: null,
						speakerDeviceId: null,
						microphoneDeviceName: null,
						speakerDeviceName: null,
						videoDeviceId: null,
						videoDeviceName: null,
					},
					email: workosUser.email,
					fullName: [
						workosUser.firstName?.trim() ?? '',
						workosUser.lastName?.trim() ?? '',
					].join(' ').trim(),
					workosUserId: workosUser.id,
					profileImageUrl: workosUser.profilePictureUrl,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
					username: workosUser.email.split('@')[0]! +
						Math.floor(Math.random() * 1000),
					lastOpenedOrganization: null,
				},
				{
					unique: {
						by_email: ['email'],
						by_username: ['username'],
						by_workosUserId: ['workosUserId'],
					},
				},
			);

			return newUserId;
		},
		error: (error) =>
			new UnexpectedError('while retrieving the user', { cause: error }),
	},
);

export const User__update = protectedMutation(
	'User',
	{
		args: {
			input: v.object({
				id: v.id('User'),
				updates: v.object({
					email: v.optional(v.string()),
					workosUserId: v.optional(v.string()),
					fullName: v.optional(v.string()),
					username: v.optional(v.string()),
					timezone: v.optional(v.string()),
					profileImageUrl: v.optional(vNullable(v.string())),
					// TODO: Fix
					callSettings: v.optional(v.any()),
					githubAccount: v.optional(
						vNullable(v.object({
							accessToken: v.string(),
							username: v.string(),
							userId: v.number(),
						})),
					),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'User', id, updates, {
				unique: {
					by_username: ['username'],
					by_email: ['email'],
					by_apiKey: ['apiKey'],
				},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the user', { cause: error }),
	},
);

export const User__delete = protectedMutation(
	'User',
	{
		args: {
			input: v.object({
				id: v.id('User'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'User', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the user', { cause: error }),
	},
);
