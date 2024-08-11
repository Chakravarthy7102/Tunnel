import { useDocumentBody } from '#utils/document.ts';
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
	type PopoverContentProps,
	PopoverTrigger,
} from '@-/design-system/v1';
import type { SlackChannel } from '@-/integrations';
import { ChevronDown, Slack } from 'lucide-react';
import { useState } from 'react';

export function SlackChannelCombobox({
	channel,
	onSelect,
	isLoading,
	data,
	align,
}: {
	channel: SlackChannel | null;
	onSelect: (channel: SlackChannel | null) => void;
	isLoading: boolean;
	data: SlackChannel[];
	align?: PopoverContentProps['align'];
}) {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

	const documentBody = useDocumentBody();

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
						<Slack className="text-muted-foreground" size={14} />
						<span>{channel ? `${channel.name}` : 'Select a channel'}</span>
					</div>
					<ChevronDown size={14} className={cn(isOpen ? 'rotate-180' : '')} />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-0"
				container={documentBody}
				align={align ?? 'end'}
			>
				<Command>
					<CommandInput
						placeholder="Search channels..."
						className="h-9"
						value={query}
						onValueChange={(e) => setQuery(e)}
					/>
					<CommandContent isLoading={isLoading}>
						<CommandEmpty>No Slack channels found.</CommandEmpty>
						<CommandGroup>
							<CommandItem
								key={'nope'}
								onSelect={() => {
									onSelect(null);
									setIsOpen(false);
								}}
								className="gap-x-2 focus:border-input border border-solid"
							>
								No channel
							</CommandItem>
							{data.map((channel) => (
								<CommandItem
									key={channel.id}
									onSelect={() => {
										onSelect({
											id: channel.id,
											name: channel.name,
										});
										setIsOpen(false);
									}}
									className="gap-x-2 focus:border-input border border-solid"
								>
									<Slack size={14} className="text-muted-foreground" />
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
