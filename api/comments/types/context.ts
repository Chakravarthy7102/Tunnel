import type { CommentsState } from '#types';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import type { DispatchWithCallback } from '@tunnel/use-state-with-callback';

type SetStateSetterAction<S> = (oldState: S) => S;

export interface CommentsContext {
	commentsState: CommentsState;
	setCommentsState: DispatchWithCallback<
		SetStateSetterAction<CommentsState>,
		CommentsState
	>;
	trpc: TrpcReact<TunnelApiRouter>;
}
