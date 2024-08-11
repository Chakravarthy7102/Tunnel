import type {
	Doc,
	Id,
	TableNames,
} from '#convex/_generated/dataModel.js';
import type { QueryCtx, Selection, ServerDoc } from '#types';
import { vInclude } from '#validators/selection.ts';
import type { Infer, Validator } from '@-/convex/values';
import { protectedQuery } from './protected-functions.ts';
import { applyInclude } from './select.ts';
import { getInclude } from './selection.ts';

interface GetHandler<
	$TableName extends TableNames,
	$FromValidator extends Validator<any, any, any>,
	$Error,
> {
	tableName: $TableName;
	validators: { from: $FromValidator };
	handler(ctx: QueryCtx, args: any): Promise<
		| Doc<$TableName>
		| Doc<$TableName>[]
		| Id<$TableName>
		| Id<$TableName>[]
		| null
	>;
	errorHandler(error: Error): $Error;
}

export function defineGetHandler<
	$TableName extends TableNames,
	$FromValidator extends Validator<any, any, any>,
	$Error,
>(
	tableName: $TableName,
	validators: { from: $FromValidator },
	handler: (ctx: QueryCtx, args: { from: Infer<$FromValidator> }) => Promise<
		| Id<$TableName>
		| Doc<$TableName>
		| null
	>,
	errorHandler: (error: Error) => $Error,
): GetHandler<$TableName, $FromValidator, $Error> {
	return {
		tableName,
		validators,
		async handler(ctx, { from }) {
			const id = await handler(ctx, { from });
			return id;
		},
		errorHandler,
	};
}

export function protectedGetQuery<
	$GetHandler extends GetHandler<any, any, any>,
>(
	getHandler: $GetHandler,
): ReturnType<
	typeof protectedQuery<
		$GetHandler['tableName'],
		ServerDoc<$GetHandler['tableName']> | null,
		{
			from: $GetHandler['validators']['from'];
			include: ReturnType<typeof vInclude>;
		},
		ReturnType<$GetHandler['errorHandler']>
	>
>;
export function protectedGetQuery<
	$GetHandler extends GetHandler<any, any, any>,
	$Selection extends Selection<$GetHandler['tableName']>,
>(
	getHandler: $GetHandler,
	selection: $Selection,
): ReturnType<
	typeof protectedQuery<
		$GetHandler['tableName'],
		ServerDoc<$Selection> | null,
		{ from: $GetHandler['validators']['from'] },
		ReturnType<$GetHandler['errorHandler']>
	>
>;
export function protectedGetQuery(
	getHandler: GetHandler<TableNames, any, any>,
	selection?: Selection<any>,
): any {
	if (selection === undefined) {
		return protectedQuery(
			getHandler.tableName,
			{
				args: {
					from: getHandler.validators.from,
					include: vInclude(),
				},
				async handler(ctx, { from, include }) {
					const id = await getHandler.handler(ctx, { from });
					return applyInclude(
						ctx,
						getHandler.tableName,
						id,
						include,
					);
				},
				error: getHandler.errorHandler,
			},
		);
	} else {
		return protectedQuery(
			getHandler.tableName,
			{
				args: {
					from: getHandler.validators.from,
				},
				async handler(ctx, { from }) {
					const id = await getHandler.handler(ctx, { from });
					return applyInclude(
						ctx,
						getHandler.tableName,
						id,
						getInclude(selection),
					);
				},
				error: getHandler.errorHandler,
			},
		);
	}
}
