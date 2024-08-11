import { SuperJSON } from '@-/superjson';
import { ok, type Result } from 'errok';

export function makeTrpcResponse<T extends Result<any, any>>(data: T) {
	return {
		result: {
			data: SuperJSON.serialize(ok(data)),
		},
	};
}
