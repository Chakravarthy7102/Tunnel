import type {
	NarrowPageToolbarContextArgs,
	PageToolbarContext,
} from '#types';

// eslint-disable-next-line complexity -- complex function
export function isContext<C, A extends Partial<NarrowPageToolbarContextArgs>>(
	untypedContext: C,
	state: any,
	args: A,
	// @ts-expect-error: works at runtime
): untypedContext is C extends PageToolbarContext<infer OldArgs> ?
	PageToolbarContext<OldArgs & A> :
	never
{
	const context = untypedContext as PageToolbarContext;

	if (args.hostEnvironmentType !== undefined) {
		if (args.hostEnvironmentType !== context.hostEnvironment.type) {
			return false;
		}
	}

	if (args.hostnameType !== undefined) {
		if (args.hostnameType !== state.hostnameType) {
			return false;
		}
	}

	if (args.actorType !== undefined) {
		if (state.actor === null && args.actorType !== null) {
			return false;
		}

		if (args.actorType === null && state.actor !== null) {
			return false;
		}

		if (
			state.actor !== null &&
			args.actorType !== null &&
			state.actor.type !== args.actorType
		) {
			return false;
		}
	}

	if (args.hasProject !== undefined) {
		if (!args.hasProject && state.projectId !== null) {
			return false;
		}

		if (args.hasProject && state.projectId === null) {
			return false;
		}
	}

	if (args.hasTunnelInstanceProxyPreview !== undefined) {
		if (
			!args.hasTunnelInstanceProxyPreview &&
			state.tunnelInstanceProxyPreviewId !== null
		) {
			return false;
		}

		if (
			args.hasTunnelInstanceProxyPreview &&
			state.tunnelInstanceProxyPreviewId === null
		) {
			return false;
		}
	}

	if (args.hasProjectLivePreview !== undefined) {
		if (!args.hasProjectLivePreview && state.projectLivePreviewId !== null) {
			return false;
		}

		if (args.hasProjectLivePreview && state.projectLivePreviewId === null) {
			return false;
		}
	}

	if (args.isOnline !== undefined) {
		if (args.isOnline && !state.isOnline) {
			return false;
		}
	}

	// if (args.enabledExperimentalFeatures !== undefined) {
	// 	if (
	// 		args.enabledExperimentalFeatures.clickToCode &&
	// 		!context.hostEnvironment.tunnelYamlConfig.experimental.clickToCode
	// 	) {
	// 		return false;
	// 	}
	// }

	return true;
}
