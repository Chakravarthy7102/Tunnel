import type { CommentsContext } from '#types';
import type { ClientDoc } from '@-/client-doc';
import { clientId } from '@-/database';
import type { Project_$organizationData } from '@-/database/selections';
import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTriggerUnstyled,
} from '@-/design-system/v1';
import { ChevronDown } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

export function ProjectSelect({
	commentsContext,
	projects,
	selectedProject,
	setSelectedProject,
}: {
	projects: ClientDoc<typeof Project_$organizationData>[];
	selectedProject: ClientDoc<typeof Project_$organizationData> | null;
	setSelectedProject: Dispatch<
		SetStateAction<ClientDoc<typeof Project_$organizationData> | null>
	>;
	commentsContext: CommentsContext;
}) {
	const { commentsState } = commentsContext;

	return (
		<Select
			value={selectedProject?._id ?? ''}
			onValueChange={(value) => {
				const project = projects.find((project) => project._id === value);
				if (project !== undefined) {
					setSelectedProject(project);
				}
			}}
		>
			<SelectTriggerUnstyled asChild>
				<Button variant="outline">
					<span className="text-ellipsis overflow-hidden whitespace-nowrap w-full max-w-[150px]">
						{selectedProject !== null ?
							selectedProject.name :
							'Select a project...'}
					</span>

					<ChevronDown size={14} className="text-muted-foreground min-w-max" />
				</Button>
			</SelectTriggerUnstyled>
			<SelectContent container={commentsState.container}>
				{projects.map((project) => (
					<SelectItem key={clientId(project._id)} value={project._id}>
						{project.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
