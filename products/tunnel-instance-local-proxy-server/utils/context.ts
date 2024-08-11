import * as contextPropertyCreators from '#context/properties/_.ts';
import type {
	CreateLocalProxyContextArgs,
	LocalProxyContext,
	NarrowLocalProxyContextArgs,
} from '#types';
import { deepmerge } from 'deepmerge-ts';
import { proxy } from 'valtio';

export function isContext<C, A extends Partial<NarrowLocalProxyContextArgs>>(
	untypedContext: C,
	args: A,
	// @ts-expect-error: works at runtime
): untypedContext is C extends LocalProxyContext<infer OldArgs> ? // TODO: Doesn't work without `& literal` for some reason
	& LocalProxyContext<OldArgs & A>
	& true :
	never
{
	const context = untypedContext as LocalProxyContext;

	if (args.actorType !== undefined) {
		if (args.actorType === null && context.state.actor !== null) {
			return false;
		}

		if (
			args.actorType !== null &&
			context.state.actor === null
		) {
			return false;
		}
	}

	if (args.isOnline !== undefined) {
		if (args.isOnline && !context.state.isOnline) {
			return false;
		}
	}

	if (args.hasProjectLivePreview !== undefined) {
		if (
			args.hasProjectLivePreview &&
			context.state.projectLivePreviewId === null
		) {
			return false;
		}

		if (
			!args.hasProjectLivePreview &&
			context.state.projectLivePreviewId !== null
		) {
			return false;
		}
	}

	return true;
}

export function createLocalProxyContext(
	createArgs: CreateLocalProxyContextArgs,
): LocalProxyContext {
	return {
		hostEnvironment: createArgs.hostEnvironment,
		state: proxy<LocalProxyContext['state']>({
			...(deepmerge(
				...Object.values(contextPropertyCreators).map((createProperties) =>
					createProperties({
						...createArgs,
					})
				),
			) as any),
		}),
	};
}
