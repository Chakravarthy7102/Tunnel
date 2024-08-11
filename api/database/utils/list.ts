import type {
	Doc,
	Id,
	TableNames,
} from '#convex/_generated/dataModel.js';
import { query } from '#convex/_generated/server.js';
import type { ArgsWithToken, QueryCtx, Selection, ServerDoc } from '#types';
import { vInclude } from '#validators/selection.ts';
import {
	type PaginationOptions,
	paginationOptsValidator,
	type PaginationResult,
	type RegisteredQuery,
} from '@-/convex/server';
import {
	type Infer,
	type ObjectType,
	v,
	type Validator,
} from '@-/convex/values';
import type { ZodSchema } from '@-/zod';
import mapObject from 'map-obj';
import type { ValueOf } from 'type-fest';
import { protectedQuery } from './protected-functions.ts';
import { applyInclude, applyPolyInclude } from './select.ts';
import { getInclude } from './selection.ts';

interface ListHandler<
	$TableName extends TableNames,
	$WhereValidator extends Validator<any, any, any>,
	$Schema extends ZodSchema | null,
	$Error,
> {
	tableName: $TableName;
	validators: { where: $WhereValidator };
	schema(ctx: QueryCtx, args: ArgsWithToken): $Schema;
	handler(
		ctx: QueryCtx,
		args: ArgsWithToken,
	): Promise<PaginationResult<Doc<$TableName>>>;
	errorHandler(error: Error): $Error;
}

interface PolyListHandler<
	$TableNames extends readonly TableNames[],
	$WhereValidator extends Validator<any, any, any>,
	$Error,
> {
	tableNames: $TableNames;
	validators: { where: $WhereValidator };
	handler(ctx: QueryCtx, args: any): Promise<
		{ _id: Id<$TableNames[number]>; __tableName: $TableNames[number] }[]
	>;
	errorHandler(error: Error): $Error;
}

export function definePolyListHandler<
	$TableNames extends readonly TableNames[],
	$WhereValidator extends Validator<any, any, any>,
	$Error,
>(
	tableNames: $TableNames,
	validators: { where: $WhereValidator },
	handler: (ctx: QueryCtx, args: { where: Infer<$WhereValidator> }) => Promise<
		{ _id: Id<$TableNames[number]>; __tableName: $TableNames[number] }[]
	>,
	errorHandler: (error: Error) => $Error,
): PolyListHandler<$TableNames, $WhereValidator, $Error> {
	return {
		tableNames,
		validators,
		handler,
		errorHandler,
	};
}

export function defineListHandler<
	$TableName extends TableNames,
	$WhereValidator extends Validator<any, any, any>,
	$Error,
>(
	tableName: $TableName,
	validators: { where: $WhereValidator },
	handler: (
		ctx: QueryCtx,
		args: {
			where: Infer<$WhereValidator>;
			paginationOpts: PaginationOptions;
		},
	) => Promise<PaginationResult<Doc<$TableName>>>,
	errorHandler: (error: Error) => $Error,
): ListHandler<$TableName, $WhereValidator, null, $Error>;
export function defineListHandler<
	$TableName extends TableNames,
	$WhereValidator extends Validator<any, any, any>,
	$Schema extends ZodSchema,
	$Error,
>(
	tableName: $TableName,
	validators: { where: $WhereValidator },
	schema: (ctx: QueryCtx, args: ArgsWithToken) => $Schema,
	handler: (
		ctx: QueryCtx,
		args: {
			where: Infer<$WhereValidator>;
			paginationOpts: PaginationOptions;
		},
	) => Promise<PaginationResult<Doc<$TableName>>>,
	errorHandler: (error: Error) => $Error,
): ListHandler<$TableName, $WhereValidator, $Schema, $Error>;
// eslint-disable-next-line max-params -- TODO
export function defineListHandler(
	tableName: string,
	validators: { where: any },
	schemaOrHandler: any,
	handlerOrErrorHandler: any,
	errorHandler?: (error: Error) => any,
): ListHandler<any, any, any, any> {
	if (errorHandler === undefined) {
		return {
			tableName,
			validators,
			schema: () => null,
			handler: schemaOrHandler,
			errorHandler: handlerOrErrorHandler,
		};
	} else {
		return {
			tableName,
			validators,
			schema: schemaOrHandler,
			handler: handlerOrErrorHandler,
			errorHandler,
		};
	}
}

export function protectedPolyListQuery<
	$ListHandler extends PolyListHandler<any, any, any>,
>(
	listHandler: $ListHandler,
): ReturnType<
	typeof protectedQuery<
		$ListHandler['tableNames'][number],
		ServerDoc<$ListHandler['tableNames'][number]>[],
		{
			where: $ListHandler['validators']['where'];
			paginationOpts: typeof paginationOptsValidator;
		},
		ReturnType<$ListHandler['errorHandler']>
	>
>;
export function protectedPolyListQuery<
	$ListHandler extends PolyListHandler<any, any, any>,
	$Selections extends {
		[$TableName in $ListHandler['tableNames'][number]]: Selection<$TableName>;
	},
>(
	listHandler: $ListHandler,
	selections: $Selections,
): ReturnType<
	typeof protectedQuery<
		$ListHandler['tableNames'][number],
		ServerDoc<ValueOf<$Selections>>[],
		{
			where: $ListHandler['validators']['where'];
			paginationOpts: typeof paginationOptsValidator;
		},
		ReturnType<$ListHandler['errorHandler']>
	>
>;
export function protectedPolyListQuery(
	listHandler: PolyListHandler<TableNames[], any, any>,
	selections?: Selection<any>,
): any {
	if (selections === undefined) {
		return protectedQuery(
			listHandler.tableNames,
			{
				args: {
					where: listHandler.validators.where,
					paginationOpts: v.optional(paginationOptsValidator),
					include: v.object(
						Object.fromEntries(
							listHandler.tableNames.map(
								(tableName) => [tableName, vInclude()],
							),
						),
					),
				},
				async handler(ctx, { where, include }) {
					return applyPolyInclude(
						ctx,
						await listHandler.handler(ctx, { where }),
						include as any,
					);
				},
				error: listHandler.errorHandler,
			},
		);
	} else {
		return protectedQuery(
			listHandler.tableNames,
			{
				args: {
					paginationOpts: v.optional(paginationOptsValidator),
					where: listHandler.validators.where,
				},
				async handler(ctx, { where }) {
					return applyPolyInclude(
						ctx,
						await listHandler.handler(ctx, { where }),
						mapObject(selections, (tableName, selection) => [
							tableName,
							getInclude(selection),
						]) as any,
					);
				},
				error: listHandler.errorHandler,
			},
		);
	}
}

export function protectedListQuery<
	$ListHandler extends ListHandler<any, any, null, any>,
>(
	listHandler: $ListHandler,
): ReturnType<
	typeof protectedQuery<
		$ListHandler['tableName'],
		PaginationResult<ServerDoc<$ListHandler['tableName']>>,
		{
			where: $ListHandler['validators']['where'];
			paginationOpts: typeof paginationOptsValidator;
			include: ReturnType<typeof vInclude>;
		},
		ReturnType<$ListHandler['errorHandler']>
	>
>;
export function protectedListQuery<
	$ListHandler extends ListHandler<any, any, null, any>,
	$Selection extends Selection<$ListHandler['tableName']>,
>(
	listHandler: $ListHandler,
	selection: $Selection,
): ReturnType<
	typeof protectedQuery<
		$ListHandler['tableName'],
		PaginationResult<ServerDoc<$Selection>>,
		{
			paginationOpts: typeof paginationOptsValidator;
			where: $ListHandler['validators']['where'];
		},
		ReturnType<$ListHandler['errorHandler']>
	>
>;
export function protectedListQuery(
	listHandler: ListHandler<TableNames, any, null, any>,
	selection?: Selection<any>,
): any {
	if (selection === undefined) {
		return protectedQuery(
			listHandler.tableName,
			{
				args: {
					where: listHandler.validators.where,
					paginationOpts: v.optional(paginationOptsValidator),
					include: vInclude(),
				},
				async handler(ctx, { where, include, paginationOpts }) {
					const paginationResult = await listHandler.handler(ctx, {
						where,
						paginationOpts,
					});
					return {
						...paginationResult,
						page: await applyInclude(
							ctx,
							listHandler.tableName,
							paginationResult.page,
							include,
						),
					};
				},
				error: listHandler.errorHandler,
			},
		);
	} else {
		return protectedQuery(
			listHandler.tableName,
			{
				args: {
					where: listHandler.validators.where,
					paginationOpts: v.optional(paginationOptsValidator),
				},
				async handler(ctx, { where, paginationOpts }) {
					paginationOpts ??= {
						cursor: null,
						numItems: 100,
					};
					const paginationResult = await listHandler.handler(ctx, {
						where,
						paginationOpts,
					});
					return {
						...paginationResult,
						page: await applyInclude(
							ctx,
							listHandler.tableName,
							paginationResult.page,
							getInclude(selection),
						),
					};
				},
				error: listHandler.errorHandler,
			},
		);
	}
}

export function listQuery<
	$ListHandler extends ListHandler<any, any, ZodSchema, any>,
>(
	listHandler: $ListHandler,
): RegisteredQuery<
	'public',
	ObjectType<{
		where: $ListHandler['validators']['where'];
		paginationOpts: typeof paginationOptsValidator;
	}>,
	PaginationResult<ServerDoc<$ListHandler['tableName']>>
>;
export function listQuery<
	$ListHandler extends ListHandler<any, any, ZodSchema, any>,
	$Selection extends Selection<$ListHandler['tableName']>,
>(
	listHandler: $ListHandler,
	selection: $Selection,
): RegisteredQuery<
	'public',
	ObjectType<{
		where: $ListHandler['validators']['where'];
		paginationOpts: typeof paginationOptsValidator;
	}>,
	PaginationResult<ServerDoc<$Selection>>
>;
export function listQuery(
	listHandler: ListHandler<TableNames, any, ZodSchema, any>,
	selection?: Selection<any>,
): any {
	if (selection === undefined) {
		return query({
			args: {
				token: v.optional(v.string()),
				hash: v.optional(v.any()),
				where: listHandler.validators.where,
				paginationOpts: v.optional(paginationOptsValidator),
				include: vInclude(),
			},
			async handler(ctx, args) {
				const parseResult = await listHandler.schema(ctx, args).safeParseAsync(
					args.where,
				);
				if (!parseResult.success) {
					throw new Error(parseResult.error.message);
				}

				const paginationResult = await listHandler.handler(ctx, {
					where: args.where,
					paginationOpts: args.paginationOpts,
				});
				return {
					...paginationResult,
					page: await applyInclude(
						ctx,
						listHandler.tableName,
						paginationResult.page,
						args.include,
					),
				};
			},
		});
	} else {
		return query({
			args: {
				token: v.optional(v.string()),
				hash: v.optional(v.any()),
				where: listHandler.validators.where,
				paginationOpts: v.optional(paginationOptsValidator),
			},
			async handler(ctx, args) {
				const parseResult = await listHandler.schema(ctx, args).safeParseAsync(
					args.where,
				);
				if (!parseResult.success) {
					throw new Error(parseResult.error.message);
				}

				args.paginationOpts ??= {
					cursor: null,
					numItems: 1000,
				};
				const paginationResult = await listHandler.handler(ctx, {
					where: args.where,
					paginationOpts: args.paginationOpts,
				});
				return {
					...paginationResult,
					page: await applyInclude(
						ctx,
						listHandler.tableName,
						paginationResult.page,
						getInclude(selection),
					),
				};
			},
		});
	}
}
