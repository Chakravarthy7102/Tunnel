import type {
	LinearAssignee,
	LinearLabel,
	LinearPriority,
	LinearProject,
	LinearStatus,
	LinearTeam,
} from '#types';
import type { ClientDoc } from '@-/client-doc';
import type {
	Organization_$memberProfileData,
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import type { Dispatch, SetStateAction } from 'react';

export interface LinearContext {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ClientDoc<typeof User_$profileData>;
	organization: ClientDoc<typeof Organization_$memberProfileData>;
	container: HTMLElement | null;
	team: LinearTeam | null;
	setTeam: Dispatch<SetStateAction<LinearTeam | null>>;
	project: LinearProject | null;
	setProject: Dispatch<SetStateAction<LinearProject | null>>;
	title: string | null | undefined;
	setTitle: Dispatch<SetStateAction<string | null | undefined>>;
	priority: LinearPriority | null;
	setPriority: Dispatch<SetStateAction<LinearPriority | null>>;
	assignee: LinearAssignee | null;
	setAssignee: Dispatch<SetStateAction<LinearAssignee | null>>;
	status: LinearStatus | null;
	setStatus: Dispatch<SetStateAction<LinearStatus | null>>;
	labels: LinearLabel[];
	setLabels: Dispatch<SetStateAction<LinearLabel[]>>;
	createAutomatically: boolean;
	setCreateAutomatically: Dispatch<SetStateAction<boolean>>;
	clear: () => void;
}
