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

export function JiraUsersCombobox({
	jiraContext,
}: {
	jiraContext: JiraContext;
}) {
	const {
		assignee,
		setAssignee,
		actorOrganizationMember,
		actorUser,
		container,
		trpc,
	} = jiraContext;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

	const response = trpc.jira.getUsers.useQuery({
		actor: { type: 'User', data: { id: actorUser._id } },
		query,
		organizationMember: { id: actorOrganizationMember._id },
	});

	const { data, status } = response;

	const users = data === undefined ?
		[] :
		data.isOk() ?
		(data.value.users?.users ?? []) :
		[];

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
						{assignee && (
							<Avatar size="sm" variant="square">
								<AvatarImage src={assignee.avatarUrl} />
							</Avatar>
						)}
						<span>{assignee ? assignee.displayName : 'Select user'}</span>
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
						placeholder="Search user..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No users found.</CommandEmpty>
						<CommandGroup>
							{users.map((user: any) => (
								<CommandItem
									key={user.id}
									onSelect={() => {
										setAssignee({
											accountId: user.accountId,
											avatarUrl: user.avatarUrl,
											displayName: user.displayName,
										});
										setIsOpen(false);
									}}
									value={user.displayName}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<Avatar size="sm" variant="square">
										<AvatarImage src={user.avatarUrl} />
									</Avatar>
									<span>{`${user.displayName}`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
