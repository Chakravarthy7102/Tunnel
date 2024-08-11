'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useOnceEffect } from '#utils/hooks.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import {
	Button,
	Input,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { UserAvatar } from '@-/user/components';
import { getTimeZones } from '@vvo/tzdb';
import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ProfileClient() {
	return <ProfileDetailsCard />;
}

const commonTimezoneIdentifiers = new Set([
	'America/Los_Angeles',
	'America/New_York',
	'Europe/London',
	'Europe/Brussels',
	'Asia/Kolkata',
]);
const _commonTimezones = getTimeZones().filter((timezone) =>
	commonTimezoneIdentifiers.has(timezone.name)
);

function ProfileDetailsCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { actorUser, setProfileImage, setActorUser } = useRouteContext(
		'(webapp)/(logged-in)',
	);
	const _documentBody = useDocumentBody();
	const [name, setName] = useState<string>(actorUser.fullName);
	const [username, setUsername] = useState<string>(actorUser.username);
	// We set the timezone in a `useEffect` to avoid hydration errors when the timezone isn't set
	const [timezone, setTimezone] = useState<string>('');
	useOnceEffect(() => {
		setTimezone(
			actorUser.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
		);
	});

	const updateUser = trpc.user.update.useMutation();
	// const [isTimezonePopoverOpen, setIsTimezonePopoverOpen] = useState(false);
	const [timezoneSearchValue, _setTimezoneSearchValue] = useState('');

	useOnceEffect(() => {
		void (async () => {
			if (actorUser.timezone === null) {
				actorUser.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
				const result = await updateUser.mutateAsync({
					actor: { type: 'User', data: { id: actorUser._id } },
					user: {
						id: actorUser._id,
					},
					updates: {
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					},
				});

				// We deliberately don't toast here because this update happens without user interaction
				if (result.isErr()) {
					console.error("Failed to automatically set the user's timezone");
				}
			}
		})();
	});

	const _filteredTimezones = useMemo(
		() =>
			getTimeZones().filter((timezone) =>
				timezone.rawFormat.toLowerCase().includes(
					timezoneSearchValue.toLowerCase(),
				)
			),
		[timezoneSearchValue],
	);

	return (
		<DashboardCard
			title="Profile settings"
			button={
				<Button
					// dprint-ignore
					disabled={
						name === actorUser.fullName &&
						username === actorUser.username &&
						timezone === actorUser.timezone
					}
					onClick={async () => {
						setIsLoading(true);
						const result = await updateUser.mutateAsync(
							{
								user: {
									id: actorUser._id,
								},
								actor: { type: 'User', data: { id: actorUser._id } },
								updates: {
									...(name !== actorUser.fullName && { fullName: name }),
									...(username !== actorUser.username &&
										{ username }),
									...(timezone !== actorUser.timezone &&
										{ timezone }),
								},
							},
						);

						setIsLoading(false);
						if (result.isErr()) {
							toast.procedureError(result);
						} else {
							setActorUser({ ...actorUser, fullName: name, username });
							toast.USER_UPDATE_SUCCESS();
						}
					}}
					isLoading={isLoading}
				>
					Save
				</Button>
			}
		>
			<div className="flex flex-col justify-center items-start w-full gap-3">
				<div className="flex flex-col justify-start items-start w-full">
					<label className="text-sm text-muted-foreground mb-1">
						Profile picture
					</label>

					<div className="group relative h-24 w-24 rounded-[5px] transition-all">
						<div className="relative h-auto w-auto group">
							<input
								type="file"
								className="opacity-0 absolute inset-0 h-full w-full z-[50] text-[0px] !cursor-pointer"
								onChange={async (e) => {
									if (e.target.files?.[0]) {
										await setProfileImage({ file: e.target.files[0] });
									}
								}}
								accept="image/*"
							/>
							<div className="bg-background/30 group-hover:flex hidden p-3 text-sm font-medium transition-all absolute inset-0 h-full w-full text-foreground z-[49] justify-center text-center items-center rounded-[5px]">
								<Pencil />
							</div>
							<UserAvatar
								size="2xl"
								variant="square"
								className="border border-border border-solid"
								profileImageUrl={actorUser.profileImageUrl}
								name={actorUser.fullName}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col justify-start items-start w-full">
					<label className="w-full">
						<div className="text-sm text-muted-foreground mb-1">Full Name</div>
						<Input onChange={(e) => setName(e.target.value)} value={name} />
					</label>
				</div>

				<div className="flex flex-col justify-start items-start w-full">
					<label className="w-full">
						<div className="text-sm text-muted-foreground mb-1">Username</div>
						<Input
							onChange={(e) => {
								const newUsername = e.target.value;
								setUsername(newUsername);
							}}
							value={username}
						/>
					</label>
				</div>

				<div className="flex flex-col justify-start items-start w-full">
					<label className="w-full">
						<div className="text-sm text-muted-foreground mb-1">Email</div>
						<Input value={actorUser.email} disabled={true} />
					</label>
				</div>

				{/* Timezone dropdown errors with: "TypeError: Cannot read properties of undefined (reading 'subscribe')" */}
				{
					/* <div className="flex flex-col justify-start items-start w-full">
					<label className="text-sm text-muted-foreground mb-1">
						Timezone
					</label>
					<Popover
						open={isTimezonePopoverOpen}
						onOpenChange={setIsTimezonePopoverOpen}
					>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={isTimezonePopoverOpen}
								className="gap-x-4 justify-between px-2 min-w-max"
								size="lg"
							>
								<div className="flex flex-row justify-start items-center gap-x-2">
									<span>{timezone}</span>
								</div>
								<ChevronDown
									size={14}
									className={cn(isTimezonePopoverOpen ? 'rotate-180' : '')}
								/>
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="min-w-[450px] p-0"
							container={documentBody}
							align="start"
						>
							<Command>
								<CommandInput
									value={timezoneSearchValue}
									onValueChange={setTimezoneSearchValue}
									placeholder="Search timezones..."
									className="h-9"
								/>
								<CommandContent isLoading={false}>
									<CommandEmpty>No timezones found.</CommandEmpty>
									<CommandGroup>
										{timezoneSearchValue === '' && (
											<>
												{commonTimezones.map((timezone) => (
													<CommandItem
														key={timezone.name}
														onSelect={() => {
															setTimezone(timezone.name);
															setTimezoneSearchValue('');
															setIsTimezonePopoverOpen(false);
														}}
														className="gap-x-2 focus:border-input border border-solid"
													>
														<span className="text-gray-500">
															{`GMT${timezone.rawFormat.split(' ')[0]}`}
														</span>
														<span>
															{timezone.alternativeName} -{' '}
															{timezone.name.split('/').at(-1)?.replaceAll(
																'_',
																' ',
															)}
														</span>
													</CommandItem>
												))}

												<CommandSeparator />
											</>
										)}
										{filteredTimezones.map((timezone) => (
											<CommandItem
												key={timezone.name}
												onSelect={() => {
													setTimezone(timezone.name);
													setTimezoneSearchValue('');
													setIsTimezonePopoverOpen(false);
												}}
												className="gap-x-2 focus:border-input border border-solid"
											>
												<span className="text-gray-500">
													{`GMT${timezone.rawFormat.split(' ')[0]}`}
												</span>
												<span>
													{timezone.alternativeName} -{' '}
													{timezone.name.split('/').at(-1)?.replaceAll(
														'_',
														' ',
													)}
												</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandContent>
							</Command>
						</PopoverContent>
					</Popover>
				</div> */
				}
			</div>
		</DashboardCard>
	);
}
