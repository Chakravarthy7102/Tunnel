import { ApiConvex } from '#api';
import {
	type CallableAction,
	type CallableMutation,
	type CallableQuery,
} from '@-/database';
import * as functions from '@-/database/functions';
import { getVapi } from '@-/database/vapi';
import {
	createNestedNamespace,
	type PropertiesWithOverride,
} from '@tunnel/namespace';
import type {
	RegisteredAction,
	RegisteredMutation,
	RegisteredQuery,
} from 'convex/server';
import { ResultAsync } from 'errok';
import type { UnionToIntersection } from 'type-fest';

// dprint-ignore
type TransformProperty<$Value> =
	$Value extends RegisteredMutation<
		'public',
		infer $Args,
		infer $Output
	> ?
		CallableMutation<
			// @ts-expect-error: works
			NonNullable<NonNullable<$Output>['__tableName']>,
			$Args['input'],
			$Output,
			// @ts-expect-error: works
			NonNullable<NonNullable<$Output>['__error__']>
		> :
	$Value extends RegisteredQuery<
		'public',
		infer $Args,
		infer $Output
	> ?
		CallableQuery<
			// @ts-expect-error: works
			NonNullable<NonNullable<$Output>['__tableName']>,
			$Args,
			$Output,
			// @ts-expect-error: works
			NonNullable<NonNullable<$Output>['__error__']>
		> :
	$Value extends RegisteredAction<
		'public',
		infer $Args,
		infer $Output
	> ?
		CallableAction<
			$Args,
			$Output,
			// @ts-expect-error: works
			NonNullable<NonNullable<$Output>['__error__']>
		> :
	$Value;

type NestedNamespace<
	$Properties,
	$Separator extends string = '_',
	$OverrideSuffix extends string = '$',
> = UnionToIntersection<
	{
		[K in keyof PropertiesWithOverride<$Properties, $OverrideSuffix>]: {
			[
				Key in K extends `${infer $Namespace}${$Separator}${string}` ?
					$Namespace :
					never
			]: {
				[
					$Key in K extends `${string}${$Separator}${infer $MethodName}` ?
						$MethodName :
						never
				]: TransformProperty<
					PropertiesWithOverride<$Properties, $OverrideSuffix>[K]
				>;
			};
		};
	}[keyof PropertiesWithOverride<$Properties, $OverrideSuffix>]
>;

export const ApiConvex_v = createNestedNamespace(
	functions,
	{
		transformProperty({ property, namespace, propertyKey }) {
			if (property?.isQuery || property?.isMutation || property?.isAction) {
				return function(args: any, options?: { token: string }) {
					const convex: any = ApiConvex.get(options);
					return ResultAsync.fromPromise(
						getVapi().then(async (vapi: any) => {
							const fn = vapi.v[`${namespace}_${propertyKey}`];
							const method = property.isMutation ?
								'mutation' :
								property.isQuery ?
								'query' :
								'action';
							return convex[method](fn, args);
						}),
						(error) => {
							// eslint-disable-next-line no-console -- todo
							console.dir(error);
							return error;
						},
					);
				};
			}

			return property;
		},
	},
) as unknown as NestedNamespace<typeof functions>;
