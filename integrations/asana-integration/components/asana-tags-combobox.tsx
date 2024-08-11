'use client';

import type { AsanaContext } from '#types';
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

export function AsanaTagsCombobox(
	{ asanaContext }: { asanaContext: AsanaContext },
) {
	const {
		tags,
		setTags,
		actorOrganizationMember,
		actorUser,
		container,
		trpc,
	} = asanaContext;

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState('');

	const response = trpc.asana.getTags.useQuery({
		organizationMember: {
			id: actorOrganizationMember._id,
		},
		actor: { type: 'User', data: { id: actorUser._id } },
	});

	const { data, status } = response;

	const asanaTags = data?.isOk() ? (data.value ?? []) : [];

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
					{tags.length > 0 ?
						(
							<div className="flex flex-row justify-start items-start gap-1 flex-wrap">
								{tags.map((tag) => (
									<Badge variant={'opp'} key={tag.gid}>
										{tag.name}
									</Badge>
								))}
							</div>
						) :
						(
							'Select tags'
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
						placeholder="Search tags..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No tags found.</CommandEmpty>
						<CommandGroup>
							{asanaTags.map((tag) => (
								<CommandItem
									key={tag.gid}
									onSelect={() => {
										if (tags.length > 0 && tags.includes(tag)) return;
										setTags([...tags, tag]);
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid justify-between"
								>
									<span>{tag.name}</span>
									<Checkbox
										checked={tags.includes(tag)}
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											if (!tags.includes(tag)) {
												setTags([...tags, tag]);
											} else {
												setTags((prev) => prev.filter((t) => tag !== t));
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
