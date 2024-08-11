'use client';

import type { JiraContext } from '#types';
import {
	Badge,
	Button,
	Checkbox,
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

export function JiraLabelsCombobox({
	jiraContext,
}: {
	jiraContext: JiraContext;
}) {
	const {
		labels,
		setLabels,
		actorUser,
		actorOrganizationMember,
		container,
		trpc,
	} = jiraContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [jiraProjectTypeQuery, setJiraProjectTypeQuery] = useState<string>('');

	const response = trpc.jira.getLabels.useQuery({
		actor: { type: 'User', data: { id: actorUser._id } },
		organizationMember: { id: actorOrganizationMember._id },
	});

	const { data, status } = response;

	const jiraLabels = data?.isOk() ? (data.value.values ?? []) : [];

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className="gap-x-4 justify-between px-2 h-auto py-2"
					size="lg"
				>
					{labels.length > 0 ?
						(
							<div className="flex flex-row justify-start items-start gap-1 flex-wrap">
								{labels.map((label) => (
									<Badge variant={'opp'} key={label}>
										{label}
									</Badge>
								))}
							</div>
						) :
						(
							'Select labels'
						)}

					<ChevronDown
						size={14}
						className={cn(isOpen ? 'rotate-180' : '', 'min-w-max')}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-0"
				container={container}
				align="end"
			>
				<Command>
					<CommandInput
						placeholder="Search labels..."
						className="h-9"
						value={jiraProjectTypeQuery}
						onValueChange={(e) => setJiraProjectTypeQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No labels found.</CommandEmpty>
						<CommandGroup>
							{jiraLabels.map((label: string) => (
								<CommandItem
									key={label}
									onSelect={() => {
										if (labels.includes(label)) return;
										setLabels([...labels, label]);
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid justify-between"
								>
									<span>{label}</span>
									<Checkbox
										checked={labels.includes(label)}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											if (!labels.includes(label)) {
												setLabels([...labels, label]);
											} else {
												setLabels((prev) => prev.filter((l) => label !== l));
											}
										}}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
