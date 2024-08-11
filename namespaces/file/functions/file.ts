import { v } from '@-/convex/values';
import type { Id, SelectOutput } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineHttpAction,
	defineMutation,
	defineQuery,
	getActorUser,
	mutation,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { createCorsHeaders } from '@-/database/http-utils';
import { getIdSchema } from '@-/database/schemas';
import { vInclude } from '@-/database/validators';
import { getVapi } from '@-/database/vapi';
import { UnexpectedError } from '@-/errors';
import { getUserIdSchema } from '@-/user/schemas';
import { z } from '@-/zod';
import { vNullable } from 'corvex';

export const File_httpGet = defineHttpAction(async (ctx, request) => {
	const { searchParams } = new globalThis.URL(request.url);
	// This storageId param should be an Id<"_storage">
	const fileId = searchParams.get('id');
	if (fileId === null) {
		return new Response('Missing fileId', {
			status: 400,
			headers: createCorsHeaders(),
		});
	}

	const vapi = await getVapi();
	const storageId = await ctx.runQuery(
		vapi.v.File_getStorageId,
		{
			input: {
				id: fileId as Id<'File'>,
			},
		},
	);

	if (storageId === null) {
		return new Response('File not found', {
			status: 404,
			headers: createCorsHeaders(),
		});
	} else {
		const blob = await ctx.storage.get(
			storageId.storageId as Id<'_storage'>,
		);
		if (blob === null) {
			return new Response('Image not found', {
				status: 404,
				headers: createCorsHeaders(),
			});
		}

		return new Response(blob, {
			headers: createCorsHeaders(),
		});
	}
});

export const File_internalGenerateUploadUrl = mutation(async (ctx) => {
	return ctx.storage.generateUploadUrl();
});

export const File_generateUploadUrl = mutation({
	args: {
		token: v.string(),
	},
	async handler(ctx, args) {
		// Only authenticated users should be able to upload files
		await getActorUser(ctx, args);

		return ctx.storage.generateUploadUrl();
	},
});

export const File_create = defineMutation({
	table: 'File',
	input: v.object({
		user: v.id('User'),
		storageIds: v.array(v.id('_storage')),
	}),
	schema: (ctx, args) => (z.object({
		user: getUserIdSchema(ctx, args, { actorRelation: 'actor' }),
		storageIds: getIdSchema(ctx, '_storage').array(),
	})),
	async handler(ctx, { input: { user, storageIds } }) {
		const ids = await Promise.all(storageIds.map(async (storageId) =>
			dbInsert(
				ctx,
				'File',
				{
					storageId,
					user,
					filepath: '',
					md5Hash: '',
					type: '',
					projectComment: null,
					projectCommentThread: null,
					projectCommentThreadSessionEventsThumbnail: null,
					projectCommentThreadConsoleLogs: null,
					projectCommentThreadNetworkLogEntries: null,
				},
				{ unique: {} },
			)
		));
		return await applyInclude(ctx, 'File', ids, {}) as SelectOutput<
			'File',
			{}
		>[];
	},
	error: (error) =>
		new UnexpectedError('while creating the file', { cause: error }),
});

export const File_getStorageId = defineQuery({
	table: 'File',
	input: v.object({
		id: v.id('File'),
	}),
	schema: (ctx) => (z.object({
		id: getIdSchema(ctx, 'File'),
	})),
	async handler(ctx, { input }) {
		const file = await ctx.db.get(input.id);
		if (file === null) {
			return null;
		}

		return { storageId: file.storageId };
	},
	error: (error) =>
		new UnexpectedError('while retrieving the file', { cause: error }),
});

export const File_get = protectedQuery('File', {
	args: {
		from: v.object({ id: v.id('File') }),
		include: vInclude(),
	},
	async handler(ctx, { from, include }) {
		return applyInclude(
			ctx,
			'File',
			from.id,
			include,
		);
	},
	error: (error) =>
		new UnexpectedError('while retrieving the file', { cause: error }),
});

export const File_list = protectedQuery('File', {
	args: {
		where: v.object({
			in: v.array(v.id('File')),
		}),
		include: vInclude(),
	},
	async handler(ctx, { where, include }) {
		return applyInclude(ctx, 'File', where.in, include);
	},
	error: (error) =>
		new UnexpectedError('while listing files', { cause: error }),
});

export const File_updateMany = protectedMutation('File', {
	args: {
		input: v.object({
			ids: v.array(v.id('File')),
			updates: v.object({
				projectComment: v.optional(vNullable(v.id('ProjectComment'))),
			}),
		}),
	},
	async handler(ctx, { input: { ids, updates } }) {
		await Promise.all(
			ids.map(async (id) =>
				dbPatch(ctx, 'File', id, updates, {
					unique: {},
				})
			),
		);
	},
	error: (error) =>
		new UnexpectedError('while updating files', { cause: error }),
});

export const File_update = protectedMutation('File', {
	args: {
		input: v.object({
			id: v.id('File'),
			updates: v.object({
				projectComment: v.optional(vNullable(v.id('ProjectComment'))),
				projectCommentThread: v.optional(
					vNullable(v.id('ProjectCommentThread')),
				),
				projectCommentThreadSessionEventsThumbnail: v.optional(
					vNullable(v.id('ProjectCommentThread')),
				),
				projectCommentThreadConsoleLogs: v.optional(
					vNullable(v.id('ProjectCommentThread')),
				),
				projectCommentThreadNetworkLogEntries: v.optional(
					vNullable(v.id('ProjectCommentThread')),
				),
			}),
		}),
	},
	async handler(ctx, { input: { id, updates } }) {
		await dbPatch(ctx, 'File', id, updates, {
			unique: {},
		});
	},
	error: (error) =>
		new UnexpectedError('while updating file', { cause: error }),
});

export const File_delete = protectedMutation('File', {
	args: {
		input: v.object({
			id: v.id('File'),
		}),
	},
	async handler(ctx, { input: { id } }) {
		await dbDelete(ctx, 'File', id);
	},
	error: (error) =>
		new UnexpectedError('while deleting the file', { cause: error }),
});

export const File_deleteMany = protectedMutation('File', {
	args: {
		input: v.object({
			ids: v.array(v.id('File')),
		}),
	},
	async handler(ctx, { input: { ids } }) {
		await Promise.all(ids.map(async (id) => dbDelete(ctx, 'File', id)));
	},
	error: (error) =>
		new UnexpectedError('while deleting files', { cause: error }),
});
