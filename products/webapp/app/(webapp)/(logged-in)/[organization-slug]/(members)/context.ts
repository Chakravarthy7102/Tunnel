'use client';

import type {
	ServerDoc,
} from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$actorProfileData,
	Project_$dashboardPageData,
} from '@-/database/selections';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export default createContext<{
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	organization: ServerDoc<
		typeof Organization_$dashboardPageData
	>;
	setOrganization: Dispatch<
		SetStateAction<ServerDoc<typeof Organization_$dashboardPageData>>
	>;
	updateOrganizationProfileImageUrl: (file: File) => Promise<void>;
	// This is separate from `organization` because guests shouldn't be able to view all projects
	projects: ServerDoc<typeof Project_$dashboardPageData>[];
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
}>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be initialized
	null!,
);
