import type { ProcedureError } from '@-/errors';
import type { MutationProcedure, QueryProcedure } from '@-/trpc/server';
import type { z, ZodSchema } from '@-/zod';
import { err, type Result } from 'errok';

declare function defineProcedure<
	$Input extends ZodSchema,
	$ReturnType extends Promise<Result<any, any>>,
	$Error extends ProcedureError<any>,
>(
	args: {
		input: $Input | ((ctx: any, input: any) => $Input);
		query: (args: {
			ctx: any;
			input: z.infer<$Input>;
		}) => $ReturnType;
		error(
			args: {
				input: z.infer<$Input>;
				error: Awaited<$ReturnType> extends Result<any, infer $OperationError> ?
					$OperationError :
					never;
			},
		): $Error;
	},
): QueryProcedure<{
	input: $Input['_input'];
	output: Awaited<$ReturnType> extends Result<infer $Value, any> ?
		Result<$Value, $Error> :
		never;
}>;
declare function defineProcedure<
	$Input extends ZodSchema,
	$ReturnType extends Promise<Result<any, any>>,
	$Error extends ProcedureError<any>,
>(
	args: {
		input: $Input | ((ctx: any, input: any) => $Input);
		mutation: (args: {
			ctx: any;
			input: z.infer<$Input>;
		}) => $ReturnType;
		error(
			args: {
				input: z.infer<$Input>;
				error: Awaited<$ReturnType> extends Result<any, infer $OperationError> ?
					$OperationError :
					never;
			},
		): $Error;
	},
): MutationProcedure<{
	input: $Input['_input'];
	output: Awaited<$ReturnType> extends Result<infer $Value, any> ?
		Result<$Value, $Error> :
		never;
}>;
export function createDefineProcedure<
	$Procedure,
	$Router,
>(
	{ procedure, router }: {
		procedure: $Procedure;
		router: $Router;
	},
) {
	return {
		defineProcedure: (({
			input,
			mutation,
			query,
			error,
			success,
		}: {
			input: any;
			mutation?: any;
			query?: any;
			error: any;
			success: any;
		}): any => {
			const operationType = mutation ?
				'mutation' :
				query ?
				'query' :
				null;
			if (operationType === null) {
				throw new Error(
					'Either `query` or `mutation` must be provided',
				);
			}

			return (procedure as any).meta({ success }).input(input)[operationType](
				async (...args: any[]) => {
					const result = await (mutation ?? query)(...args);
					if (
						'isErr' in result &&
						typeof result.isErr === 'function' &&
						result.isErr() &&
						'error' in result
					) {
						return err(error({ input: args[0].input, error: result.error }));
					}

					return result;
				},
			);
		}) as typeof defineProcedure,
		router,
	};
}
