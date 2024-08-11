import { mutation, query } from '#convex/_generated/server.js';
import type { ArgsWithToken, MutationCtx, QueryCtx, TableNames } from '#types';
import type {
	RegisteredMutation,
	RegisteredQuery,
	ValidatedFunction,
} from '@-/convex/server';
import {
	type Infer,
	type PropertyValidators,
	v,
	type Validator,
} from '@-/convex/values';
import type { z } from '@-/zod';
import { sha256 } from 'js-sha256';
import sortKeys from 'sort-keys';

// dprint-ignore
export function protectedQuery<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$Output,
	$ArgsValidator extends PropertyValidators,
	$Error
>(
	_tableName: $TableName,
	{ args, handler }: ValidatedFunction<
		QueryCtx,
		$ArgsValidator,
		$Output
	> & { error: (error: Error) => $Error }
):
	RegisteredQuery<
		'public',
		{ [$Key in keyof $ArgsValidator]: Infer<$ArgsValidator[$Key]> },
		($Output & { __tableName?: $TableName, __error__?: $Error }) |
		(null extends $Output ? null : never)
	>
{
	return query({
		args: {
			token: v.optional(v.string()),
			hash: v.string(),
			...args
		},
		async handler(ctx, args: any) {
			const {
				hash,
				// We exclude pagination opts from our hash since it doesn't affect permissions
				paginationOpts: _paginationOpts,
				token: _token,
				...functionArgs
			} = args;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be defined
			if (hash !== process.env.CONVEX_SECRET && hash !== sha256(process.env.CONVEX_SECRET! + JSON.stringify(sortKeys(functionArgs, { deep: true })))) {
				throw new Error('Invalid hash')
			}

			return handler(ctx, args);
		},
	}) as any;
}

// dprint-ignore
export function protectedMutation<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$Output,
	$ArgsValidator extends { input: Validator<any, any, any> },
	$Error
>(
	_tableName: $TableName,
	{ args, handler }: ValidatedFunction<
		MutationCtx,
		$ArgsValidator,
		$Output
	> & { error: (error: Error) => $Error }
):
	RegisteredMutation<
		'public',
		{ input: Infer<$ArgsValidator['input']> },
		$Output & {
			__tableName?: $TableName extends ReadonlyArray<any> ? $TableName[number] : $TableName,
			__error__?: $Error
		}
	>
{
	return mutation({
		args: { hash: v.string(), ...args },
		async handler(ctx, args: any) {
			const { hash, ...functionArgs } = args;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be defined
			if (hash !== process.env.CONVEX_SECRET && hash !== sha256(process.env.CONVEX_SECRET! + JSON.stringify(sortKeys(functionArgs, { deep: true })))) {
				throw new Error('Invalid hash')
			}

			return handler(ctx, args);
		},
	}) as any;
}

export function defineMutation<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$InputValidator extends Validator<any, any, any>,
	$Schema extends z.ZodSchema<any, any, Infer<$InputValidator>>,
	$Output,
	$Error,
>({
	input,
	schema,
	handler,
}: {
	table: $TableName;
	input: $InputValidator;
	handler: ValidatedFunction<
		MutationCtx,
		{ input: Validator<z.infer<$Schema>, false, any> },
		$Output
	>['handler'];
	schema(ctx: MutationCtx, args: any): $Schema;
	error(error: Error): $Error;
}): RegisteredMutation<
	'public',
	{ input: Infer<$InputValidator> },
	$Output & { __tableName?: $TableName; __error__?: $Error }
> {
	return mutation({
		args: {
			input,
			token: v.optional(v.string()),
			// For backwards-compat
			hash: v.optional(v.any()),
		},
		async handler(ctx, args) {
			const input = await schema(ctx, args).parseAsync((args as any).input);
			return handler(ctx, { input });
		},
	}) as any;
}

export function defineQuery<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$InputValidator extends Validator<any, any, any>,
	$Schema extends z.ZodSchema<any, any, Infer<$InputValidator>>,
	$Output,
	$Error,
>({
	input,
	schema,
	handler,
}: {
	table: $TableName;
	input: $InputValidator;
	handler: ValidatedFunction<
		QueryCtx,
		{ input: Validator<z.infer<$Schema>, false, any> },
		$Output
	>['handler'];
	schema(ctx: QueryCtx, args: ArgsWithToken): $Schema;
	error(error: Error): $Error;
}): RegisteredQuery<
	'public',
	{ input: Infer<$InputValidator> },
	$Output & { __tableName?: $TableName; __error__?: $Error }
> {
	return query({
		args: {
			input,
			token: v.optional(v.string()),
			// For backwards-compat
			hash: v.optional(v.any()),
		},
		async handler(ctx, args) {
			const input = await schema(ctx, args).parseAsync((args as any).input);
			return handler(ctx, { input });
		},
	}) as any;
}
