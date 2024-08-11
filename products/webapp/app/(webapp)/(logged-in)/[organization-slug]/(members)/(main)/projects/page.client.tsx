'use client';

import {
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { CreateProjectButton } from '#components/v1/create-project-button.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { ProjectLinks } from '#components/v1/project-links.tsx';
import { useRouteContext } from '#utils/route-context.ts';

export default function OrganizationProjectsClientPage() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const {
		organization,
		actorOrganizationMember,
		projects,
		setProjects,
	} = useRouteContext('(webapp)/(logged-in)/[organization-slug]/(members)');

	return (
		<>
			<HeaderContainer>
				<HeaderTitle
					actorOrganizationMember={actorOrganizationMember}
				>
					Projects
				</HeaderTitle>
				<div className="flex flex-row justify-center items-center gap-x-1">
					{actorOrganizationMember.role !== 'guest' &&
						(
							<CreateProjectButton
								size="sm"
								actorUser={actorUser}
								organization={organization}
								setProjects={setProjects}
								actorOrganizationMember={actorOrganizationMember}
							>
								New project
							</CreateProjectButton>
						)}
				</div>
			</HeaderContainer>

			<DashboardContainer>
				<ProjectLinks
					projects={projects}
					actorUser={actorUser}
					organization={organization}
					setProjects={setProjects}
					actorOrganizationMember={actorOrganizationMember}
				/>
			</DashboardContainer>
		</>
	);
}
