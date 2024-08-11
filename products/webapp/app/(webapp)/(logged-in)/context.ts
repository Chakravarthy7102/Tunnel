'use client';

import type { ServerDoc } from '@-/database';
import type {
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export default createContext<{
	actorUser: ServerDoc<typeof User_$profileData>;
	setActorUser: Dispatch<
		SetStateAction<ServerDoc<typeof User_$profileData>>
	>;
	setProfileImage(args: { file: File }): Promise<void>;
	actorOrganizationMembers: ServerDoc<
		typeof OrganizationMember_$actorProfileData
	>[];
	setActorOrganizationMembers: Dispatch<
		SetStateAction<
			ServerDoc<typeof OrganizationMember_$actorProfileData>[]
		>
	>;
}>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be initialized
	null!,
);
