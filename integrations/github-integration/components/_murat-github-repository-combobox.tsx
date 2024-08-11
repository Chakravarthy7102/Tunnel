import type { GithubRepository } from '#types';
import type { ClientDoc } from '@-/client-doc';
import {
	Button,
	cn,
	CommandContent,
	CommandEmpty,
	CommandGroup,
	MuratCommand,
	MuratCommandInput,
	MuratCommandItem,
	MuratPopoverContent,
	Popover,
	PopoverTrigger,
} from '@-/design-system/v1';
import type { TrpcReact } from '@-/trpc/client';
import type { TunnelApiRouter } from '@-/webapp';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function MuratGithubRepositoryCombobox({
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
					variant="input"
					role="combobox"
					size="muratsm"
					aria-expanded={isOpen}
					className={cn('justify-between', isFullWidth && 'w-full')}
				>
					{value ? value.full_name : 'Select a repository'}
					<ChevronDown
						size={14}
						className={cn(
							'text-muted-foreground transition-all',
							isOpen ? 'rotate-180' : 'rotate-0',
						)}
					/>
				</Button>
			</PopoverTrigger>
			<MuratPopoverContent
				className="p-0 w-full"
				container={container}
				side="bottom"
				align="start"
			>
				<MuratCommand
					style={{
						width: 'var(--radix-popover-trigger-width)',
					}}
				>
					<MuratCommandInput placeholder="Search repositories..." />
					<CommandContent isLoading={status === 'pending'}>
						<CommandEmpty>No repositories found.</CommandEmpty>
						<CommandGroup>
							{repositories.map((repository) => (
								<MuratCommandItem
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
								</MuratCommandItem>
							))}
						</CommandGroup>
					</CommandContent>
				</MuratCommand>
			</MuratPopoverContent>
		</Popover>
	);
}
