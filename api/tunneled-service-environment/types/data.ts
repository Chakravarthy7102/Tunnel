import type { Id, ServerDoc } from '@-/database';
import type {
	Organization_$tunneledServiceEnvironmentData,
	Project_$tunneledServiceEnvironmentData,
	ProjectLivePreview_$tunneledServiceEnvironmentData,
	TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData,
} from '@-/database/selections';
import type {
	HostEnvironment,
	HostEnvironmentType,
} from '@-/host-environment';

// dprint-ignore
export interface TunneledServiceData<
	$HostEnvironmentType extends HostEnvironmentType
> {
	organization:
		ServerDoc<typeof Organization_$tunneledServiceEnvironmentData> |
		(
			HostEnvironmentType.wrapperCommand extends $HostEnvironmentType ?
				null :
			never
		) |
		// If the `data-project-id` is invalid, `organization` might be null
		(
			HostEnvironmentType.scriptTag extends $HostEnvironmentType ?
				null :
			never
		);

	project:
		ServerDoc<typeof Project_$tunneledServiceEnvironmentData> |
		(
			HostEnvironmentType.wrapperCommand extends $HostEnvironmentType ?
				null :
			never
		) |
		// If the `data-project-id` is invalid, `project` might be null
		(
			HostEnvironmentType.scriptTag extends $HostEnvironmentType ?
				null :
			never
		);


	/**
		These properties are only relevant for a tunnel that's proxied through our tunnelapp server
	*/
	tunnelInstanceProxyPreview:
		ServerDoc<typeof TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData> |
		(
			HostEnvironmentType.wrapperCommand extends $HostEnvironmentType ?
				null :
			never
		) |
		(
			HostEnvironmentType.scriptTag extends $HostEnvironmentType ?
				null :
			never
		);

	/**
		When the host environment is "tunnelShare", there is at least one live preview (however, this isn't encoded in the type because it ends up requiring too much type gymnastics).

		In a "wrapperCommand" host environment, the user is able to switch between live previews from the toolbar.

		In a "scriptTag" host environment, the host can be a local URL which might not have a live preview.
	*/
	activeProjectLivePreviewId:
		Id<'ProjectLivePreview'> |
		(
			HostEnvironmentType.wrapperCommand extends $HostEnvironmentType ?
				null :
			never
		) |
		(
			HostEnvironmentType.scriptTag extends $HostEnvironmentType ?
				null :
			never
		)
	projectLivePreviews: Record<string, ServerDoc<typeof ProjectLivePreview_$tunneledServiceEnvironmentData>>
}

export interface TunneledServiceServerData<
	$HostEnvironmentType extends HostEnvironmentType,
> extends TunneledServiceData<$HostEnvironmentType> {}

/*
	The data that is sent to a tunnelapp page before it starts loading
*/
// dprint-ignore
export interface TunneledServiceEnvironmentData<
	$HostEnvironmentType extends HostEnvironmentType
> extends TunneledServiceServerData<$HostEnvironmentType> {
	hostEnvironment: HostEnvironment<$HostEnvironmentType>;
}
