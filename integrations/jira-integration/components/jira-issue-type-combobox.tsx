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

export function JiraProjectIssueTypeCombobox({
	projectId,
	jiraContext,
}: {
	projectId: string;
	jiraContext: JiraContext;
}) {
	const {
		issueType,
		setIssueType,
		trpc,
		actorOrganizationMember,
		actorUser,
		container,
	} = jiraContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [jiraProjectTypeQuery, setJiraProjectTypeQuery] = useState<string>('');

	const response = trpc.jira.getProjectIssueTypes.useQuery({
		actor: { type: 'User', data: { id: actorUser._id } },
		organizationMember: { id: actorOrganizationMember._id },
		projectId,
	});

	const { data, status } = response;
	const jiraProjectIssueTypes = data?.isOk() ? data.value : [];

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
						{issueType !== null && (
							<Avatar size="sm" variant="square">
								<AvatarImage src={issueType.iconUrl} />
							</Avatar>
						)}
						<span>{issueType ? `${issueType.name}` : 'Select issue type'}</span>
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
						placeholder="Search issue types..."
						className="h-9"
						value={jiraProjectTypeQuery}
						onValueChange={(e) => setJiraProjectTypeQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No issue types found.</CommandEmpty>
						<CommandGroup>
							{jiraProjectIssueTypes.map((type: any) => (
								<CommandItem
									key={type.id}
									onSelect={() => {
										setIssueType({
											id: type.id,
											iconUrl: type.iconUrl,
											name: type.name,
											subtask: type.subtask,
										});
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<Avatar size="sm" variant="square">
										<AvatarImage src={type.iconUrl} />
									</Avatar>
									<span>{`${type.name}`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
