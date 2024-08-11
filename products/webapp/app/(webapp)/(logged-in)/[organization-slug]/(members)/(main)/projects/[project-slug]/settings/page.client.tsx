'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { ProjectDeleteCard } from '#components/v1/cards/projects/project-delete-card.tsx';
import { ProjectSettingsCard } from '#components/v1/cards/projects/project-settings-card.tsx';
import { CodeBlock } from '#components/v1/ui/code-block.tsx';
import { useRouteContext } from '#utils/route-context.ts';

export default function PageClient() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, setProjects } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project, setProject } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	return (
		<>
			<ProjectSettingsCard
				actorUser={actorUser}
				project={project}
				setProject={setProject}
			/>
			<DashboardCard
				title="Project ID"
				subtitle="Copy your project ID to use with Tunnel's script tag"
			>
				{/* We use the project slug since it's guaranteed not to change */}
				<CodeBlock text={project.slug}>{project.slug}</CodeBlock>
			</DashboardCard>

			<ProjectDeleteCard
				actorUser={actorUser}
				project={project}
				organization={organization}
				setProjects={setProjects}
			/>
		</>
	);
}
