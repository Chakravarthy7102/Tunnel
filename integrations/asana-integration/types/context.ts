'use client';

import type { ClientDoc } from '@-/client-doc';
import type {
	Organization_$memberProfileData,
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type {
	AsanaAssignee,
	AsanaParentTask,
	AsanaProject,
	AsanaSection,
	AsanaTag,
} from '@-/integrations';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import type { Dispatch, SetStateAction } from 'react';

export interface AsanaContext {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ClientDoc<typeof User_$profileData>;
	organization: ClientDoc<typeof Organization_$memberProfileData>;
	container: HTMLElement | null;
	project: AsanaProject | null;
	setProject: Dispatch<SetStateAction<AsanaProject | null>>;
	name: string | null | undefined;
	setName: Dispatch<SetStateAction<string | null | undefined>>;
	section: AsanaSection | null;
	setSection: Dispatch<SetStateAction<AsanaSection | null>>;
	assignee: AsanaAssignee | null;
	setAssignee: Dispatch<SetStateAction<AsanaAssignee | null>>;
	parentTask: AsanaParentTask | null;
	setParentTask: Dispatch<SetStateAction<AsanaParentTask | null>>;
	tags: AsanaTag[];
	setTags: Dispatch<SetStateAction<AsanaTag[]>>;
	createAutomatically: boolean;
	setCreateAutomatically: Dispatch<SetStateAction<boolean>>;
	clear: () => void;
}
