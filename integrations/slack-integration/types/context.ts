'use client';

import type { ClientDoc } from '@-/client-doc';
import type {
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type { SlackChannel } from '@-/integrations';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import type { Dispatch, SetStateAction } from 'react';

export interface SlackContext {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ClientDoc<typeof User_$profileData>;
	container: HTMLElement | null;
	channel: SlackChannel | null;
	setChannel: Dispatch<SetStateAction<SlackChannel | null>>;
	clear: () => void;
}
