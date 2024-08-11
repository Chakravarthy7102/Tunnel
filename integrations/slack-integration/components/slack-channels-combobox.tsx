'use client';

import type { SlackContext } from '#types';
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
import type { SlackChannel } from '@-/integrations';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function SlackChannelsCombobox(
	{ slackContext }: { slackContext: SlackContext },
) {
	const {
		actorOrganizationMember,
		actorUser,
		trpc,
		channel,
		setChannel,
		container,
	} = slackContext;
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

	const response = trpc.slack.getChannels.useQuery({
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		organizationMember: {
			id: actorOrganizationMember._id,
		},
	});

	const { data, status } = response;

	const slackChannels =
		(data?.isOk() ? (data.value ?? []) : []) as SlackChannel[];

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
						<span>{channel ? `${channel.name}` : 'Select channel'}</span>
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
						placeholder="Search channels..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No Slack channels found.</CommandEmpty>
						<CommandGroup>
							{slackChannels.map((channel) => (
								<CommandItem
									key={channel.id}
									onSelect={() => {
										setChannel({
											id: channel.id,
											name: channel.name,
										});
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<span>{`${channel.name}`}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
