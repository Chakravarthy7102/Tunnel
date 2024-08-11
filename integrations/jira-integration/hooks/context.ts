'use client';

import type { JiraContext, JiraForm } from '#types';
import type { ClientDoc } from '@-/client-doc';
import type {
	Organization_$memberProfileData,
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type {
	JiraAssignee,
	JiraIssueType,
	JiraParentIssue,
	JiraProject,
} from '@-/integrations';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { useEffect, useState } from 'react';

interface JiraContextInput {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ClientDoc<typeof User_$profileData>;
	actorOrganization: ClientDoc<typeof Organization_$memberProfileData>;
	container: HTMLElement | null;
}

export function useJiraContext(
	contextInfo: JiraContextInput | null,
	defaultForm: JiraForm | null,
	autoCreate: boolean,
) {
	const [project, setProject] = useState<JiraProject | null>(
		defaultForm?.project ?? null,
	);

	const [title, setTitle] = useState<string | null | undefined>(null);

	const [issueType, setIssueType] = useState<JiraIssueType | null>(
		defaultForm?.issueType ?? null,
	);
	const [parentIssue, setParentIssue] = useState<JiraParentIssue | null>(
		null,
	);
	const [assignee, setAssignee] = useState<JiraAssignee | null>(
		defaultForm?.assignee ?? null,
	);
	const [labels, setLabels] = useState<string[]>(
		defaultForm?.labels ?? [],
	);

	const [createAutomatically, setCreateAutomatically] = useState<boolean>(
		autoCreate,
	);

	const clear = () => {
		setProject(null);
		setIssueType(null);
		setParentIssue(null);
		setAssignee(null);
		setLabels([]);
		setCreateAutomatically(false);
	};

	useEffect(() => {
		if (!project || !issueType || (issueType.subtask && !parentIssue)) {
			setCreateAutomatically(false);
		}
	}, [
		createAutomatically,
		assignee,
		issueType,
		labels,
		parentIssue,
		project,
		setCreateAutomatically,
	]);

	useEffect(() => {
		setProject(defaultForm?.project ?? null);
		setIssueType(defaultForm?.issueType ?? null);
		setParentIssue(null);
		setAssignee(defaultForm?.assignee ?? null);
		setLabels(defaultForm?.labels ?? []);
		setCreateAutomatically(autoCreate);
	}, [defaultForm]);

	if (contextInfo === null) {
		return null;
	}

	return {
		trpc: contextInfo.trpc,
		project,
		setProject,
		title,
		setTitle,
		issueType,
		setIssueType,
		parentIssue,
		setParentIssue,
		assignee,
		setAssignee,
		labels,
		setLabels,
		createAutomatically,
		setCreateAutomatically,
		actorOrganizationMember: contextInfo.actorOrganizationMember,
		actorOrganization: contextInfo.actorOrganization,
		actorUser: contextInfo.actorUser,
		container: contextInfo.container,
		clear,
	} satisfies JiraContext;
}
