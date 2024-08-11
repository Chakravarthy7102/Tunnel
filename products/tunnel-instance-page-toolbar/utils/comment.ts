import type { PageToolbarContext } from '#types';
import { getToolbarAuthClient } from '@-/auth/toolbar';
import type { CommentsContext, CommentsState } from '@-/comments';
import { resolveId } from '@-/database';
import { RELEASE } from '@-/env/app';
import { createTrpcReact, getAuthorizationHeaders } from '@-/trpc/client';
import { ApiUrl } from '@-/url/api';
import type { TunnelApiRouter } from '@-/webapp';
import onetime from 'onetime';
import deepmerge from 'plaindeepmerge';
import { useContextStore } from './context/use.ts';
import { useShadowRoot, useShadowRootElement } from './shadow-root.ts';

const getTrpc = onetime(() => {
	const { trpc, links } = createTrpcReact<TunnelApiRouter>({
		siteUrl: `${
			ApiUrl.getWebappUrl({ withScheme: true, fromRelease: RELEASE })
		}/api/trpc`,
		async headers({ op }) {
			const authorizationHeaders = await getAuthorizationHeaders({
				op,
				async getAccessToken({ actor }) {
					const authClient = getToolbarAuthClient();
					try {
						return (await authClient.getAccessToken({
							actorUserId: actor.data.id,
						})) ?? null;
					} catch {
						return null;
					}
				},
			});

			return {
				...authorizationHeaders,
			};
		},
	});

	return {
		trpc,
		trpcClient: trpc.createClient({ links }),
	};
});

export function useCommentsContext({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
	}>;
}): CommentsContext & { trpcClient: any } {
	const contextState = useContextStore(context);
	const shadowRoot = useShadowRoot();
	const shadowRootElement = useShadowRootElement();
	const { trpc, trpcClient } = getTrpc();

	const getCommentsState = (state: typeof contextState) => ({
		$collections: state.$collections,
		$pendingActions: state.$pendingActions,
		$nextPendingActionId: state.$nextPendingActionId,
		userActor: state.actor,
		actorUserId: state.actor.data.id,
		actorOrganizationMemberId: state.actorOrganizationMemberId,
		focusedCommentThreadId: resolveId(state.focusedCommentThreadId),
		activeCommentThreadId: resolveId(state.activeCommentThreadId),
		commentThreadIds: state.commentThreadIds ?? [],
		filteredProjectCommentThreadIds: [],
		currentResolvedCommentThreadIds: state.currentResolvedCommentThreadIds ??
			[],
		container: shadowRootElement,
		shadowRoot: 'host' in shadowRoot ? shadowRoot : null,

		hostEnvironmentType: context.hostEnvironment.type,
	} satisfies CommentsState);

	const setCommentsState = (
		state: CommentsState | ((oldState: CommentsState) => CommentsState),
		cb?: (newState: CommentsState) => void,
	) => {
		const oldCommentsState = getCommentsState(context.store.getState());
		const newCommentsState = typeof state === 'function' ?
			state(oldCommentsState) :
			state;

		context.store.setState((state) => ({
			...state,
			$collections: deepmerge(
				state.$collections,
				newCommentsState.$collections,
			),
			actor: newCommentsState.userActor,
			actorUserId: newCommentsState.actorUserId,
			focusedCommentThreadId: resolveId(
				newCommentsState.focusedCommentThreadId,
			),
			activeCommentThreadId: resolveId(newCommentsState.activeCommentThreadId),
			commentThreadIds: newCommentsState.commentThreadIds,
			currentResolvedCommentThreadIds:
				newCommentsState.currentResolvedCommentThreadIds,
		}));
		cb?.(getCommentsState(context.store.getState()));
	};

	return {
		commentsState: getCommentsState(contextState),
		setCommentsState,
		trpc,
		trpcClient,
	};
}
