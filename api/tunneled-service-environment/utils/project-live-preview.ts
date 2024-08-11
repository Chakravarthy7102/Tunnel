import type { TunneledServiceEnvironmentData } from '#types';
import type { ServerDoc } from '@-/database';
import type { ProjectLivePreview_$tunneledServiceEnvironmentData } from '@-/database/selections';
import type { HostEnvironmentType } from '@-/host-environment';
import invariant from 'tiny-invariant';

export function getActiveProjectLivePreview(
	tunneledServiceEnvironmentData:
		| TunneledServiceEnvironmentData<HostEnvironmentType.scriptTag>
		| TunneledServiceEnvironmentData<HostEnvironmentType.wrapperCommand>
		| TunneledServiceEnvironmentData<HostEnvironmentType.tunnelShare>
		| TunneledServiceEnvironmentData<HostEnvironmentType>,
):
	| ServerDoc<
		typeof ProjectLivePreview_$tunneledServiceEnvironmentData
	>
	| null
{
	if (tunneledServiceEnvironmentData.activeProjectLivePreviewId === null) {
		return null;
	}

	const activeProjectLivePreview =
		tunneledServiceEnvironmentData.projectLivePreviews[
			tunneledServiceEnvironmentData.activeProjectLivePreviewId
		];

	invariant(
		activeProjectLivePreview !== undefined,
		'The active project live preview is guaranteed to be in `projectLivePreviews`',
	);

	return activeProjectLivePreview;
}
