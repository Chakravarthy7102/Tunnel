'use client';

import type { ClientDoc } from '@-/client-doc';
import type {
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type { SlackChannel } from '@-/integrations';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { useState } from 'react';

export interface SlackContextInput {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ClientDoc<typeof User_$profileData>;
	container: HTMLElement | null;
	initialSlackMessage?: {
		channel: SlackChannel | null;
	};
}

export const useSlackContext = (args: SlackContextInput | null) => {
	const [channel, setChannel] = useState<SlackChannel | null>(
		args?.initialSlackMessage?.channel ?? null,
	);

	const clear = () => {
		setChannel(null);
	};

	if (args === null) {
		return null;
	}

	return {
		trpc: args.trpc,
		actorOrganizationMember: args.actorOrganizationMember,
		actorUser: args.actorUser,
		container: args.container,
		channel,
		setChannel,
		clear,
	};
};
