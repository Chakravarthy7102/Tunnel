import type { GithubRepository } from '#types';
import type { ClientDoc } from '@-/client-doc';
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
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function GithubRepositoryCombobox({
	value,
	setValue,
	organization,
	actorUser,
	isFullWidth,
	container,
	trpc,
}: {
	value: GithubRepository | null;
	setValue: (repo: GithubRepository | null) => void;
	organization: ClientDoc<'Organization'>;
	actorUser: ClientDoc<'User'>;
	isFullWidth: boolean;
	container: HTMLElement | null;
	trpc: TrpcReact<TunnelApiRouter>;
}) {
	const [isOpen, setIsOpen] = useState(false);

	const response = trpc.organization.listRepositories.useQuery({
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		organization: { id: organization._id },
	});

	const { data, status } = response;
	const repositories = data === undefined ?
		[] :
		data.isErr() ?
		[] :
		(data.value ?? []);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className={cn('justify-between', isFullWidth && 'w-full')}
				>
					{value ? value.full_name : 'Select a repository'}
					<ChevronDown size={14} className="text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-full p-0"
				container={container}
				side="bottom"
				align="start"
			>
				<Command className="w-full">
					<CommandInput
						placeholder="Search repositories..."
						className="h-9 w-full"
					/>
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No repositories found.</CommandEmpty>
						<CommandGroup>
							{repositories.map((repository) => (
								<CommandItem
									key={repository.id}
									onSelect={(currentValue) => {
										const repo = repositories.find(
											(r) =>
												r.full_name.toLowerCase() ===
													currentValue.toLowerCase(),
										) ?? null;

										if (repo === value) {
											setValue(null);
										} else {
											setValue(repo);
										}

										setIsOpen(false);
									}}
								>
									{repository.full_name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
