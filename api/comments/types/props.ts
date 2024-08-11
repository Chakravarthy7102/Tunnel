import type { CommentsState } from '#types';
import type { ServerDoc } from '@-/database';
import type { OrganizationMember_$commentsProviderData } from '@-/database/selections';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import type { DispatchWithCallback } from '@tunnel/use-state-with-callback';
import type { SetStateAction } from 'react';

export interface CommentsProviderProps {
	state: CommentsState;
	setState: DispatchWithCallback<SetStateAction<CommentsState>, CommentsState>;
	trpc: TrpcReact<TunnelApiRouter>;
	container: HTMLElement | null;
	actorOrganizationMember:
		| ServerDoc<typeof OrganizationMember_$commentsProviderData>
		| null;
}
