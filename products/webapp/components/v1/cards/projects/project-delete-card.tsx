'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { DeleteProjectButton } from '#components/v1/delete-project-button.tsx';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import type { Dispatch, SetStateAction } from 'react';

export function ProjectDeleteCard({
	project,
	actorUser,
	organization,
	setProjects,
}: {
	project: ServerDoc<typeof Project_$dashboardPageData>;
	actorUser: ServerDoc<typeof User_$profileData>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
}) {
	return (
		<DashboardCard
			isDanger
			title="Danger Zone"
			subtitle="Delete this project"
			button={
				<DeleteProjectButton
					project={project}
					organization={organization}
					setProjects={setProjects}
					actorUser={actorUser}
					variant="destructive"
				>
					Delete this project
				</DeleteProjectButton>
			}
		/>
	);
}
