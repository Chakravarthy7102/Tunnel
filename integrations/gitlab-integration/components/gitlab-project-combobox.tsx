import type { GitlabProject } from '#types';
import type { ClientDoc } from '@-/client-doc';
import {
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
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function GitlabProjectCombobox({
	value,
	setValue,
	organizationMember,
	actorUser,
	isFullWidth,
	container,
	trpc,
}: {
	value: GitlabProject | null;
	setValue: (repo: GitlabProject | null) => void;
	organizationMember: ClientDoc<'OrganizationMember'>;
	actorUser: ClientDoc<'User'>;
	isFullWidth: boolean;
	container: HTMLElement | null;
	trpc: TrpcReact<TunnelApiRouter>;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const response = trpc.gitlab.listProjects.useQuery({
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		organizationMember: { id: organizationMember._id },
	});

	const { data, status } = response;

	const projects = data === undefined ?
		[] :
		data.isErr() ?
		[] :
		(data.value);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className={cn('justify-between', isFullWidth && 'w-full')}
				>
					{value ? value.name : 'Select a project'}
					<ChevronDown size={14} className="text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				container={container}
				side="bottom"
				align="start"
			>
				<Command className="w-full">
					<CommandInput
						placeholder="Search projects..."
						className="h-9 w-full"
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No projects found.</CommandEmpty>
						<CommandGroup>
							{projects.map((project) => (
								<CommandItem
									key={project.id}
									onSelect={(currentValue) => {
										const repo = projects.find(
											(r) =>
												r.name.toLowerCase() ===
													currentValue.toLowerCase(),
										) ?? null;

										if (repo === value) {
											setValue(null);
										} else {
											setValue(repo);
										}

										setIsOpen(false);
									}}
								>
									{project.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
