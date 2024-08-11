'use client';

import type { LinearContext } from '#types';
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
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function LinearAssigneeCombobox(
	{ linearContext }: { linearContext: LinearContext },
) {
	const {
		trpc,
		actorOrganizationMember,
		actorUser,
		container,
		assignee,
		setAssignee,
		team,
	} = linearContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState('');

	const response = trpc.linear.getTeamMembers.useQuery({
		organizationMember: {
			id: actorOrganizationMember._id,
		},
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		teamId: team?.id ?? '',
	});

	const { data, status } = response;
	const members = data?.isOk() ? data.value : [];

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className="gap-x-4 justify-between px-2  min-w-max"
					size="lg"
				>
					<div className="flex flex-row justify-start items-center gap-x-2">
						<span>{assignee ? `${assignee.name}` : 'Select user'}</span>
					</div>
					<ChevronDown size={14} className={cn(isOpen ? 'rotate-180' : '')} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-0"
				container={container}
				align="end"
			>
				<Command>
					<CommandInput
						placeholder="Search users..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No assignees found.</CommandEmpty>
						<CommandGroup>
							{members.map((filteredAssignee) => (
								<CommandItem
									key={filteredAssignee.id}
									onSelect={() => {
										setAssignee(filteredAssignee);
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<span>{`${filteredAssignee.name}`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
