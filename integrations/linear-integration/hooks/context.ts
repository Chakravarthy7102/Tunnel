'use client';

import type {
	LinearAssignee,
	LinearForm,
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
import { useEffect, useState } from 'react';

interface LinearContextInput {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	organization: ClientDoc<typeof Organization_$memberProfileData>;
	actorUser: ClientDoc<typeof User_$profileData>;
	container: HTMLElement | null;
}

export function useLinearContext(
	contextInput: LinearContextInput | null,
	defaultForm: LinearForm | null,
	autoCreate: boolean,
) {
	const [team, setTeam] = useState<LinearTeam | null>(
		defaultForm?.team ?? null,
	);
	const [project, setProject] = useState<LinearProject | null>(
		defaultForm?.project ?? null,
	);
	const [title, setTitle] = useState<string | null | undefined>(null);
	const [priority, setPriority] = useState<LinearPriority | null>(
		defaultForm?.priority ?? null,
	);
	const [assignee, setAssignee] = useState<LinearAssignee | null>(
		defaultForm?.assignee ?? null,
	);
	const [status, setStatus] = useState<LinearStatus | null>(
		defaultForm?.status ?? null,
	);
	const [labels, setLabels] = useState<LinearLabel[]>(
		defaultForm?.labels ?? [],
	);
	const [createAutomatically, setCreateAutomatically] = useState<boolean>(
		autoCreate,
	);

	const clear = () => {
		setTeam(null);
		setProject(null);
		setPriority(null);
		setAssignee(null);
		setStatus(null);
		setLabels([]);
		setCreateAutomatically(false);
	};

	useEffect(() => {
		setTeam(defaultForm?.team ?? null);
		setProject(
			defaultForm?.project ?? null,
		);
		setAssignee(defaultForm?.assignee ?? null);
		setStatus(defaultForm?.status ?? null);
		setLabels(defaultForm?.labels ?? []);
		setPriority(defaultForm?.priority ?? null);
		setCreateAutomatically(autoCreate);
	}, [defaultForm]);

	if (contextInput === null) {
		return null;
	}

	return {
		trpc: contextInput.trpc,
		actorOrganizationMember: contextInput.actorOrganizationMember,
		actorUser: contextInput.actorUser,
		container: contextInput.container,
		team,
		setTeam,
		project,
		setProject,
		title,
		setTitle,
		priority,
		setPriority,
		assignee,
		setAssignee,
		status,
		setStatus,
		labels,
		setLabels,
		createAutomatically,
		setCreateAutomatically,
		clear,
		organization: contextInput.organization,
	};
}
