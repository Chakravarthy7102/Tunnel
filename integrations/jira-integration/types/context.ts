import type {
	JiraAssignee,
	JiraIssueType,
	JiraParentIssue,
	JiraProject,
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

export interface JiraContext {
	trpc: TrpcReact<TunnelApiRouter>;
	project: JiraProject | null;
	setProject: Dispatch<SetStateAction<JiraProject | null>>;
	issueType: JiraIssueType | null;
	setIssueType: Dispatch<SetStateAction<JiraIssueType | null>>;
	parentIssue: JiraParentIssue | null;
	setParentIssue: Dispatch<SetStateAction<JiraParentIssue | null>>;
	assignee: JiraAssignee | null;
	setAssignee: Dispatch<SetStateAction<JiraAssignee | null>>;
	labels: string[];
	setLabels: Dispatch<SetStateAction<string[]>>;
	createAutomatically: boolean;
	setCreateAutomatically: Dispatch<SetStateAction<boolean>>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorOrganization: ClientDoc<typeof Organization_$memberProfileData>;
	actorUser: ClientDoc<typeof User_$profileData>;
	container: HTMLElement | null;
	title: string | null | undefined;
	setTitle: Dispatch<SetStateAction<string | null | undefined>>;
	clear: () => void;
}
