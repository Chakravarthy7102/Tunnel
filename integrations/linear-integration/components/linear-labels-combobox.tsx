'use client';

import type { LinearContext } from '#types';
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

export function LinearLabelsCombobox(
	{ linearContext }: { linearContext: LinearContext },
) {
	const {
		labels,
		setLabels,
		actorUser,
		actorOrganizationMember,
		container,
		trpc,
		team,
	} = linearContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

	const response = trpc.linear.getLabels.useQuery({
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

	const linearLabels = data?.isOk() ? data.value : [];

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
									<Badge variant={'opp'} key={label.id}>
										{label.name}
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
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No labels found.</CommandEmpty>
						<CommandGroup>
							{linearLabels.map((label) => (
								<CommandItem
									key={label.id}
									onSelect={() => {
										if (labels.some((l) => l.id === label.id)) return;
										setLabels([...labels, label]);
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid justify-between"
								>
									<span>{label.name}</span>
									<Checkbox
										checked={labels.includes(label)}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											if (!labels.some((l) => l.id === label.id)) {
												setLabels([...labels, label]);
											} else {
												setLabels((prev) =>
													prev.filter((l) => label.id !== l.id)
												);
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
