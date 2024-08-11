'use client';

import type { JiraContext } from '#types';
import {
	Avatar,
	AvatarImage,
	Button,
	cn,
	Command,
	CommandContent,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@-/design-system/v1';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function JiraProjectCombobox({
	jiraContext,
}: {
	jiraContext: JiraContext;
}) {
	const {
		actorUser,
		actorOrganizationMember,
		container,
		trpc,
		project,
		setProject,
	} = jiraContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [jiraProjectsQuery, setJiraProjectsQuery] = useState<string>('');

	const response = trpc.jira.getProjects.useQuery({
		actor: { type: 'User', data: { id: actorUser._id } },
		organizationMember: { id: actorOrganizationMember._id },
	});

	const { data, status } = response;
	const jiraProjects = data?.isOk() ? data.value.values : [];

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className="gap-x-4 justify-between px-2 min-w-max"
					size="lg"
				>
					<div className="flex flex-row justify-start items-center gap-x-2">
						{project !== null && (
							<Avatar size="sm" variant="square">
								<AvatarImage src={project.avatarUrl} />
							</Avatar>
						)}
						<span>{project ? project.name : 'Select project'}</span>
					</div>
					<ChevronDown size={14} className={cn(isOpen ? 'rotate-180' : '')} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-0"
				container={container}
				align="end"
				// This prevents the dialog from closing when the title is generated
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<Command>
					<CommandInput
						placeholder="Search project..."
						className="h-9"
						value={jiraProjectsQuery}
						onValueChange={(e) => setJiraProjectsQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No projects found.</CommandEmpty>
						<CommandGroup>
							{jiraProjects.map((jiraProject: any) => (
								<CommandItem
									key={jiraProject.id}
									onSelect={() => {
										setProject({
											id: jiraProject.id,
											name: jiraProject.name,
											key: jiraProject.key,
											avatarUrl: jiraProject.avatarUrls['48x48'],
										});
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<Avatar size="sm" variant="square">
										<AvatarImage src={jiraProject.avatarUrls['48x48']} />
									</Avatar>
									<span>{`${jiraProject.name} (${jiraProject.key})`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
