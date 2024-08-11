// dprint-ignore-file

import type {
	SelectInput,
	SelectOutput,
} from './_.ts';
import type { ResultAsync } from 'errok';
import type { TableNames } from '#convex/_generated/dataModel.js'
import type { FunctionReference, PaginationResult } from '@-/convex/server'
import type { FunctionOptions } from '@-/convex';

export type FunctionReferenceArgs<
	$ApiFunctionReference extends FunctionReference<'query' | 'mutation', any>,
> = $ApiFunctionReference extends FunctionReference<
	any,
	any,
	infer $Args,
	any
> ? $Args :
	unknown;

export type FunctionReferenceReturnType<
	$ApiFunctionReference extends FunctionReference<'query' | 'mutation', any>,
> = $ApiFunctionReference extends FunctionReference<
	any,
	any,
	any,
	infer $ReturnType
> ? $ReturnType :
	unknown;

export type CallableQueryFromFunctionReference<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$ApiFunctionReference extends FunctionReference<'query', any>,
	$Err
> =
	$ApiFunctionReference extends FunctionReference<
		any,
		any,
		infer $Args,
		infer $ReturnType
	> ?
		CallableQuery<$TableName, $Args, $ReturnType, $Err> :
	never;

export type CallableQuery<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$Args,
	$ReturnType,
	$Err
> =
	$TableName extends ReadonlyArray<infer $TableNames extends TableNames> ?
		// For convex queries with selections, we want to use a generic type to make sure the selection is valid
		'include' extends keyof $Args ?
			<
				$TableName extends $TableNames,
				const $Include extends SelectInput<$TableName>,
				// @ts-expect-error: works
				$From extends $Args['from']
			>(
				args: {
					[$ArgKey in keyof $Args]:
						$ArgKey extends 'include' ?
							$Include :
						$ArgKey extends 'type' ?
							$TableName :
						$ArgKey extends 'from' ?
							$From :
						$Args[$ArgKey];
				},
				options?: FunctionOptions
			) => ResultAsync<
				'include' extends keyof $Args ?
					NonNullable<Awaited<$ReturnType>> extends PaginationResult<any> ?
						PaginationResult<SelectOutput<$TableName, $Include>> :
					NonNullable<Awaited<$ReturnType>> extends Array<any> ?
						SelectOutput<$TableName, $Include>[] :
					SelectOutput<$TableName, $Include> |
					null :
				$ReturnType,
				$Err
			> :

		'type' extends keyof $Args ?
			<$TableName extends $TableNames>(
				args: {
					[$ArgKey in keyof $Args]:
						$ArgKey extends 'type' ?
							$TableName :
						$Args[$ArgKey];
				},
				options?: FunctionOptions
			) => ResultAsync<Awaited<$ReturnType>, $Err> :

		(args: $Args) => ResultAsync<Awaited<$ReturnType>, $Err> :
	$TableName extends TableNames ?
		// For convex queries with selections, we want to use a generic type to make sure the selection is valid
		'include' extends keyof $Args ?
			<
				const $Include extends SelectInput<$TableName>,
				// @ts-expect-error: works
				$From extends $Args['from']
			>(
				args: {
					[$ArgKey in keyof $Args]: $ArgKey extends 'include' ? $Include :
						$ArgKey extends 'from' ?
							$From :
						$Args[$ArgKey];
				},
				options?: FunctionOptions
			) => ResultAsync<
				'include' extends keyof $Args ?
					NonNullable<Awaited<$ReturnType>> extends PaginationResult<any> ?
						PaginationResult<SelectOutput<$TableName, $Include>> :
					NonNullable<Awaited<$ReturnType>> extends Array<any> ?
						SelectOutput<$TableName, $Include>[] :
					SelectOutput<$TableName, $Include> |
					null :
				$ReturnType,
				$Err
			> :
		(
			args: $Args,
			options?: FunctionOptions
		) => ResultAsync<Awaited<$ReturnType>, $Err> :

	never;

export type CallableMutation<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$InputArgs,
	$ReturnType,
	$Err
> =
	$TableName extends ReadonlyArray<infer $TableNames extends TableNames> ?
		'include' extends keyof $InputArgs ?
			<$TableName extends $TableNames, const $Include extends SelectInput<$TableName>>(
				args: {
					input: {
						[$ArgKey in keyof $InputArgs]:
							$ArgKey extends 'include' ?
								$Include :
							$ArgKey extends 'type' ?
								$TableName :
							$InputArgs[$ArgKey];
					}
				},
				options?: FunctionOptions
			) => ResultAsync<
				'include' extends keyof $InputArgs ?
					NonNullable<Awaited<$ReturnType>> extends { doc: Array<any> } ?
						Omit<NonNullable<Awaited<$ReturnType>>, 'doc'> & { doc: SelectOutput<$TableName, $Include>[] } :
					NonNullable<Awaited<$ReturnType>> extends { doc: any } ?
						Omit<NonNullable<Awaited<$ReturnType>>, 'doc'> & { doc: SelectOutput<$TableName, $Include> } :
					SelectOutput<$TableName, $Include> :
				$ReturnType,
				$Err
			> :

		// For convex update mutations, we want to use the `Exact` type to make sure no excess properties are passed to the mutation
		'updates' extends keyof $InputArgs ?
			<$TableName extends $TableNames, const $Updates extends $InputArgs['updates']>(
				args: {
					input: {
						[$ArgKey in keyof $InputArgs]:
							$ArgKey extends 'updates' ?
								$Updates :
							$ArgKey extends 'type' ?
								$TableName :
							$InputArgs[$ArgKey];
					}
				},
				options?: FunctionOptions
			) => ResultAsync<Awaited<$ReturnType>, $Err> :

		'type' extends keyof $InputArgs ?
			<$TableName extends $TableNames>(
				args: {
					input: {
						[$ArgKey in keyof $InputArgs]:
							$ArgKey extends 'type' ?
								$TableName :
							$InputArgs[$ArgKey];
					}
				},
				options?: FunctionOptions
			) => ResultAsync<Awaited<$ReturnType>, $Err> :

		(args: $InputArgs) => ResultAsync<$ReturnType, $Err> :
	$TableName extends TableNames ?
		'include' extends keyof $InputArgs ?
			<const $Include extends SelectInput<$TableName>>(
				args: {
					input: {
						[$ArgKey in keyof $InputArgs]: $ArgKey extends 'include' ? $Include :
							$InputArgs[$ArgKey];
					}
				},
				options?: FunctionOptions
			) => ResultAsync<
				'include' extends keyof $InputArgs ?
					NonNullable<Awaited<$ReturnType>> extends { doc: Array<any> } ?
						Omit<NonNullable<Awaited<$ReturnType>>, 'doc'> & { doc: SelectOutput<$TableName, $Include>[] } :
					NonNullable<Awaited<$ReturnType>> extends { doc: any } ?
						Omit<NonNullable<Awaited<$ReturnType>>, 'doc'> & { doc: SelectOutput<$TableName, $Include> } :
					SelectOutput<$TableName, $Include> :
				$ReturnType,
				$Err
			> :

		// For convex update mutations, we want to use the `Exact` type to make sure no excess properties are passed to the mutation
		'updates' extends keyof $InputArgs ?
			<const $Updates extends $InputArgs['updates']>(
				args: {
					input: {
						[$ArgKey in keyof $InputArgs]: $ArgKey extends 'updates' ? $Updates :
							$InputArgs[$ArgKey];
					}
				},
				options?: FunctionOptions
			) => ResultAsync<Awaited<$ReturnType>, $Err> :

		(
			args: { input: $InputArgs },
			options?: FunctionOptions
		) => ResultAsync<Awaited<$ReturnType>, $Err> :

	never;

export type CallableMutationFromFunctionReference<
	$TableName extends TableNames | ReadonlyArray<TableNames>,
	$ApiFunctionReference extends FunctionReference<'mutation', any>,
	$Err
> =
	$ApiFunctionReference extends FunctionReference<
		any,
		any,
		infer $Args,
		infer $ReturnType
	> ?
		CallableMutation<$TableName, $Args['input'], $ReturnType, $Err> :
	never

export type CallableAction<
	$Args,
	$ReturnType,
	_$Err
> = (
	args: $Args,
	options?: FunctionOptions
) => ResultAsync<Awaited<$ReturnType>, Error>