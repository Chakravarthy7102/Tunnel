import { ApiConvex } from '@-/convex/api';
import type {
	Id,
	SelectInput,
	SelectOutput,
} from '@-/database';
import type { UnexpectedError } from '@-/errors';
import { createId } from '@paralleldrive/cuid2';
import { $try, ok, type ResultAsync } from 'errok';

export const ApiProjectLivePreview_create = <
	// dprint-ignore
	const $Include extends SelectInput<'ProjectLivePreview'>,
>({
	input: {
		projectLivePreview,
		include,
	},
}: {
	input: {
		projectLivePreview: {
			linkedTunnelInstanceProxyPreview:
				| Id<'TunnelInstanceProxyPreview'>
				| null;
			project: Id<'Project'>;
			url: string;
			isLive: boolean;
			createdByUser: Id<'User'>;
		};
		include: $Include;
	};
}): ResultAsync<
	SelectOutput<'ProjectLivePreview', $Include>,
	UnexpectedError
> => ($try(async function*() {
	// TODO: Make the permission a reasonable default based on who is creating the tunnel instance
	const viewPermission = 'anyoneWithLink';

	const projectLivePreviewSelection = yield* ApiConvex.v.ProjectLivePreview
		._create({
			input: {
				projectLivePreview: {
					...projectLivePreview,
					liveshareLink: null,
					dailyRoomName: createId(),
					viewPermission,
				},
				include: include as any,
			},
		}).safeUnwrap();

	return ok(
		projectLivePreviewSelection as any,
	);
}));
