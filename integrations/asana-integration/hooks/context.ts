'use client';

import type { ClientDoc } from '@-/client-doc';
import type {
	Organization_$memberProfileData,
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import type {
	AsanaAssignee,
	AsanaForm,
	AsanaParentTask,
	AsanaProject,
	AsanaSection,
	AsanaTag,
} from '@-/integrations';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { useEffect, useState } from 'react';

interface AsanaContextInput {
	trpc: TrpcReact<TunnelApiRouter>;
	actorOrganizationMember: ClientDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	organization: ClientDoc<typeof Organization_$memberProfileData>;
	actorUser: ClientDoc<typeof User_$profileData>;
	container: HTMLElement | null;
}

export const useAsanaContext = (
	contextInput: AsanaContextInput | null,
	defaultForm: AsanaForm | null,
	autoCreate: boolean,
) => {
	const [project, setProject] = useState<AsanaProject | null>(
		defaultForm?.project ?? null,
	);
	const [name, setName] = useState<string | null | undefined>(null);
	const [section, setSection] = useState<AsanaSection | null>(
		defaultForm?.section ?? null,
	);
	const [assignee, setAssignee] = useState<AsanaAssignee | null>(
		defaultForm?.assignee ?? null,
	);
	const [parentTask, setParentTask] = useState<AsanaParentTask | null>(null);
	const [tags, setTags] = useState<AsanaTag[]>(
		defaultForm?.tags ?? [],
	);
	const [createAutomatically, setCreateAutomatically] = useState<boolean>(
		autoCreate,
	);

	const clear = () => {
		setProject(null);
		setCreateAutomatically(false);
	};

	useEffect(() => {
		setProject(
			defaultForm?.project ?? null,
		);
		setAssignee(defaultForm?.assignee ?? null);
		setSection(defaultForm?.section ?? null);
		setParentTask(defaultForm?.parentTask ?? null);
		setTags(defaultForm?.tags ?? []);
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
		project,
		setProject,
		name,
		setName,
		section,
		setSection,
		assignee,
		setAssignee,
		parentTask,
		setParentTask,
		tags,
		setTags,
		createAutomatically,
		setCreateAutomatically,
		clear,
		organization: contextInput.organization,
	};
};
