import { err, ok, type Result } from 'errok';
import { SuperJSON } from 'superjson';

SuperJSON.registerCustom<
	Result<unknown, unknown>,
	{ value: any } | { error: any }
>(
	{
		isApplicable(result): result is Result<unknown, unknown> {
			// instanceof doesn't work because errok ships both CJS and ESM
			return typeof result === 'object' && result !== null &&
				'isOk' in result && 'isErr' in result;
		},
		serialize: (result) =>
			result.isOk() ?
				{ value: SuperJSON.serialize(result.value) } :
				{ error: SuperJSON.serialize(result.error) },
		deserialize(result) {
			if ('value' in result) {
				return ok(SuperJSON.deserialize(result.value));
			} else {
				return err(SuperJSON.deserialize(result.error));
			}
		},
	},
	'errok',
);

export * from 'superjson';
