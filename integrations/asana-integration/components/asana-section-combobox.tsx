'use client';

import type { AsanaContext } from '#types';
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

export function AsanaSectionCombobox(
	{ asanaContext }: { asanaContext: AsanaContext },
) {
	const {
		trpc,
		actorOrganizationMember,
		actorUser,
		container,
		project,
		section,
		setSection,
	} = asanaContext;

	if (!project) {
		return null;
	}

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState('');

	const response = trpc.asana.getSections.useQuery({
		organizationMember: {
			id: actorOrganizationMember._id,
		},
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		project,
	});

	const { data, status } = response;
	const sections = data?.isOk() ? (data.value ?? []) : [];

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
						<span>{section ? `${section.name}` : 'Select section'}</span>
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
						placeholder="Search sections..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No sections found.</CommandEmpty>
						<CommandGroup>
							{sections.map((section) => (
								<CommandItem
									key={section.gid}
									onSelect={() => {
										setSection(section);
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<span>{`${section.name}`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
