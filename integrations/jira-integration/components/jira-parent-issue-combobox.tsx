'use client';

import type { JiraContext } from '#types';
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

export function JiraParentIssueCombobox({
	projectId,
	jiraContext,
}: {
	projectId: string;
	jiraContext: JiraContext;
}) {
	const {
		actorUser,
		actorOrganizationMember,
		container,
		trpc,
		parentIssue,
		setParentIssue,
	} = jiraContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [jiraProjectsQuery, setJiraProjectsQuery] = useState<string>('');

	const response = trpc.jira.getIssue.useQuery({
		actor: { type: 'User', data: { id: actorUser._id } },
		query: jiraProjectsQuery,
		projectId,
		organizationMember: { id: actorOrganizationMember._id },
	});

	const { data, status } = response;
	const jiraIssues = data?.isOk() ?
		(data.value.sections?.[0]?.issues ?? []) :
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
						<span>{parentIssue ? `${parentIssue.key}` : 'Select issue'}</span>
					</div>
					<ChevronDown size={14} className={cn(isOpen ? 'rotate-180' : '')} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-0"
				container={container}
				align="start"
			>
				<Command>
					<CommandInput
						placeholder="Search project..."
						className="h-9"
						value={jiraProjectsQuery}
						onValueChange={(e) => setJiraProjectsQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No issues found.</CommandEmpty>
						<CommandGroup>
							{jiraIssues.map((issue: any) => (
								<CommandItem
									key={issue.id}
									onSelect={() => {
										setParentIssue({
											summary: issue.summary,
											key: issue.key,
											id: issue.id,
										});
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<span>{`${issue.summary} (${issue.key})`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
