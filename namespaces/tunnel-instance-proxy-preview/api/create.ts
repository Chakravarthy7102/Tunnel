import { ApiConvex } from '@-/convex/api';
import {
	type Id,
	type SelectInput,
	type SelectOutput,
} from '@-/database';
import type { UnexpectedError } from '@-/errors';
import { $try, ok, type ResultAsync } from 'errok';

export const ApiTunnelInstanceProxyPreview_create = <
	// dprint-ignore
	$Include extends SelectInput<'TunnelInstanceProxyPreview'>,
>({ input: { data, include } }: {
	input: {
		data: {
			createdByUser: Id<'User'>;
			project: Id<'Project'>;
			gitUrl: string | null;
			localServicePortNumber: number;
			localServiceOriginalPortNumber: number;
			localTunnelProxyServerPortNumber: number;
		};
		include: $Include;
	};
}): ResultAsync<
	SelectOutput<'TunnelInstanceProxyPreview', $Include>,
	UnexpectedError
> => ($try(async function*() {
	const tunnelInstanceProxyPreview = yield* ApiConvex.v
		.TunnelInstanceProxyPreview._create({
			input: {
				data: {
					...data,
					localUrl: null,
					projectPath: null,
					updatedAt: Date.now(),
					allowedPortNumbers: [data.localTunnelProxyServerPortNumber],
					disallowedPortNumbers: [],
					// We set it as active when the websocket connection is established
					isActive: false,
				},
				include: {
					...include,
					createdByUser: (include.createdByUser ?? true),
				} as any,
			},
		}).safeUnwrap();

	return ok(
		tunnelInstanceProxyPreview as any,
	);
}));
