import * as tables from '#tables/_.ts';
import { v, type Validator } from '@-/convex/values';
import {
	dbDelete,
	dbInsert,
	dbPatch,
	protectedMutation,
} from '@-/database/function-utils';
import { UnexpectedError } from '@-/errors';
import { objectKeys } from '@tunnel/ts';
import { includeKeys } from 'filter-obj';
import mapObject from 'map-obj';
import type { ValueOf } from 'type-fest';

const accountTables = includeKeys(tables, (key) => key.endsWith('Account')) as {
	[
		$Key in keyof typeof tables as $Key extends `${string}Account` ? $Key :
			never
	]: typeof tables[$Key];
};

const accountTableNames = objectKeys(accountTables);
const accountTableCreateValidators = mapObject(
	accountTables,
	(tableName, table) => [
		tableName,
		v.object({
			type: v.literal(tableName),
			data: table.schema,
		}),
	],
) as {
	[$TableName in keyof typeof accountTables]: ReturnType<
		typeof v.object<{
			type: ReturnType<typeof v.literal<$TableName>>;
			data: typeof accountTables[$TableName]['schema'];
		}>
	>;
};

export const OrganizationMemberIntegration_create = protectedMutation(
	accountTableNames,
	{
		args: {
			input: v.union(
				// @ts-expect-error: works at runtime
				...Object.values(accountTableCreateValidators),
			) as Validator<
				ValueOf<typeof accountTableCreateValidators>['type'],
				false,
				ValueOf<typeof accountTableCreateValidators>['fieldPaths']
			>,
		},
		async handler(ctx, { input: { type, data } }) {
			const tableName = type;
			await dbInsert(
				ctx,
				tableName,
				data,
				{ unique: {} },
			);
		},
		error: (error) =>
			new UnexpectedError('while updating the integration', { cause: error }),
	},
);

export const OrganizationMemberIntegration_update = protectedMutation(
	accountTableNames,
	{
		args: {
			input: v.object({
				type: v.union(
					// @ts-expect-error: works at runtime
					...accountTableNames.map((accountTable) => v.literal(accountTable)),
				) as Validator<keyof typeof accountTables>,
				where: v.object({
					organizationMember: v.id('OrganizationMember'),
				}),
				updates: v.object({
					expiresIn: v.optional(v.number()),
					createdAt: v.optional(v.number()),
					accessToken: v.optional(v.string()),
					refreshToken: v.optional(v.string()),
				}),
			}),
		},
		async handler(ctx, { input: { type, where, updates } }) {
			const tableName = type;
			const organizationMemberIntegration = await ctx.db.query(tableName)
				.withIndex(
					'by_organizationMember',
					(q) => q.eq('organizationMember', where.organizationMember),
				).first();

			if (organizationMemberIntegration === null) {
				return null;
			}

			await dbPatch(
				ctx,
				tableName,
				organizationMemberIntegration._id,
				updates,
				{ unique: {} },
			);
		},
		error: (error) =>
			new UnexpectedError('while updating the integration', { cause: error }),
	},
);

export const OrganizationMemberIntegration_delete = protectedMutation(
	accountTableNames,
	{
		args: {
			input: v.object({
				type: v.union(
					// @ts-expect-error: works at runtime
					...accountTableNames.map((accountTable) => v.literal(accountTable)),
				) as Validator<keyof typeof accountTables>,
				where: v.object({
					organizationMember: v.id('OrganizationMember'),
				}),
			}),
		},
		async handler(ctx, { input: { type, where } }) {
			const tableName = type;
			const organizationMemberIntegration = await ctx.db.query(tableName)
				.withIndex(
					'by_organizationMember',
					(q) => q.eq('organizationMember', where.organizationMember),
				).first();

			if (organizationMemberIntegration === null) {
				return null;
			}

			await dbDelete(
				ctx,
				tableName,
				organizationMemberIntegration._id,
			);
		},
		error: (error) =>
			new UnexpectedError('while deleting the integration', { cause: error }),
	},
);
