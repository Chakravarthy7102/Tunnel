'use client';

import { CreateProjectButton } from '#components/v1/create-project-button.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useAuth } from '#utils/auth.client.ts';
import { DISCORD_URL } from '#utils/constants.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import type { api, ServerDoc } from '@-/database';
import type { OrganizationMember_$actorProfileData } from '@-/database/selections';
import {
	Avatar,
	AvatarImage,
	Badge,
	Button,
	buttonVariants,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Separator,
} from '@-/design-system/v1';
import { UserAvatar } from '@-/user/components';
import {
	Book,
	ChevronsUpDown,
	FolderKanban,
	HelpCircle,
	Home,
	Leaf,
	LogOut,
	Plus,
	PlusIcon,
	Settings,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SideMenu({
	actorOrganizationMember: actorOrganizationMemberArg,
}: {
	actorOrganizationMember:
		| ServerDoc<typeof OrganizationMember_$actorProfileData>
		| NonNullPreloaded<
			typeof api.v.OrganizationMember_get_actorProfileData
		>;
}) {
	const {
		actorUser,
		actorOrganizationMembers,
	} = useRouteContext('(webapp)/(logged-in)');
	const { organization, projects, setProjects } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const pathname = usePathname();
	const { signOut } = useAuth();
	const documentBody = useDocumentBody();
	const [actorOrganizationMember] = '_id' in actorOrganizationMemberArg ?
		usePreloadedQueryState(actorOrganizationMemberArg) :
		usePreloadedQueryState(actorOrganizationMemberArg);

	const sidebarPath = pathname.split('/')[2];

	return (
		<div className="h-full flex-col w-[240px] max-w-[240px] px-3 border-border border-solid border-r hidden md:flex">
			<div
				className={cn(
					'w-full flex flex-row justify-between items-center h-16 gap-2',
				)}
			>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" className="flex px-2 gap-x-3">
							<div className="flex flex-row justify-center items-center gap-x-2">
								<Avatar size="sm">
									{organization.profileImageUrl !== null && (
										<AvatarImage src={organization.profileImageUrl} />
									)}
								</Avatar>
								<p className="text-sm line-clamp-1 text-left">
									{organization.name}
								</p>
							</div>

							<ChevronsUpDown size={14} className="text-muted-foreground" />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						container={documentBody}
						align="start"
						className="p-0 border border-input border-solid"
					>
						<div className="flex flex-col justify-center items-start w-full py-2 px-1">
							<div className="flex flex-row justify-start items-center gap-x-1.5 p-2 mb-1">
								<p className="text-xs text-muted-foreground">
									{organization.name}
								</p>
								<Badge
									variant={organization.subscriptionPlan === 'free' ?
										'orange' :
										'green'}
									size={'xs'}
								>
									{organization.subscriptionPlan.charAt(0).toUpperCase() +
										organization.subscriptionPlan.slice(1)}
								</Badge>
							</div>

							{actorOrganizationMember &&
								actorOrganizationMember.role !== 'member' && (
								<div className="flex flex-col justify-center items-center gap-y-1 w-full">
									<Link
										className={cn(
											buttonVariants({
												variant: 'ghost',
											}),
											'w-full justify-start gap-x-3 px-2',
										)}
										href={`/${organization.slug}/settings`}
									>
										<Settings size={14} className="text-muted-foreground" />
										Settings
									</Link>
									<Link
										className={cn(
											buttonVariants({
												variant: 'ghost',
											}),
											'w-full justify-start gap-x-3 px-2',
										)}
										href={`/${organization.slug}/settings/people`}
									>
										<Users size={14} className="text-muted-foreground" />
										Invite people
									</Link>
								</div>
							)}
						</div>
						<Separator className="bg-input" />
						<div className="flex flex-col justify-center items-start w-full py-2 px-1">
							<p className="text-xs text-muted-foreground mb-1 p-2">
								Switch organization
							</p>
							<div className="flex flex-col justify-center items-center gap-y-1 w-full">
								{actorOrganizationMembers
									.filter(
										(organizationMember) =>
											organizationMember.organization._id !==
												organization._id,
									)
									.map((organizationMember) => (
										<Link
											key={organizationMember.organization._id}
											href={`/${organizationMember.organization.slug}`}
											className={cn(
												buttonVariants({
													variant: 'ghost',
												}),
												'w-full justify-start gap-x-2 px-2',
											)}
										>
											<Avatar size="sm">
												{organizationMember.organization.profileImageUrl !==
														null && (
													<AvatarImage
														src={organizationMember.organization
															.profileImageUrl}
													/>
												)}
											</Avatar>
											{organizationMember.organization.name}
										</Link>
									))}
								<Link
									href="/join"
									className={cn(
										buttonVariants({
											variant: 'ghost',
										}),
										'w-full justify-start gap-x-2 px-2',
									)}
								>
									<PlusIcon size={14} />
									New organization
								</Link>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
			<div className="h-full flex flex-col justify-between items-center w-full pb-4">
				<div className="flex flex-col justify-center items-center w-full gap-0.5">
					<SideMenuLink
						href={`/${organization.slug}/`}
						isActive={sidebarPath === 'comments' || sidebarPath === undefined}
					>
						<div className="flex flex-row justify-center items-center gap-x-2">
							<Home size={14} />
							Home
						</div>
					</SideMenuLink>
					<SideMenuLink
						href={`/${organization.slug}/projects`}
						isActive={sidebarPath === 'projects'}
					>
						<FolderKanban size={14} />
						Projects
					</SideMenuLink>
					<SideMenuLink
						href={`/${organization.slug}/settings`}
						isActive={sidebarPath === 'settings'}
					>
						<Settings size={14} />
						Settings
					</SideMenuLink>
					<SideMenuLink
						href={`/${organization.slug}/get-started`}
						isActive={sidebarPath === 'get-started'}
					>
						<div className="flex flex-row justify-between items-center w-full">
							<div className="flex flex-row justify-center items-center gap-x-2">
								<Leaf size={14} />
								Get Started
							</div>
						</div>
					</SideMenuLink>

					{projects.length > 0 && (
						<>
							<div className="text-sm flex w-full justify-between mt-6 mb-2 px-2">
								<p className="text-accent-foreground">Projects</p>
								{actorOrganizationMember &&
									actorOrganizationMember.role !== 'guest' && (
									<p className="text-muted-foreground flex items-center hover:text-accent-foreground">
										<CreateProjectButton
											actorUser={actorUser}
											organization={organization}
											setProjects={setProjects}
											actorOrganizationMember={actorOrganizationMember}
											variant="none"
											size="none"
										>
											<Plus size={14} className="mr-1" /> New
										</CreateProjectButton>
									</p>
								)}
							</div>

							{projects.map((project) => (
								<SideMenuLink
									key={project._id}
									href={`/${organization.slug}/projects/${project.slug}`}
									isActive={pathname.includes(project._id)}
								>
									<FolderKanban size={14} className="min-w-max" />
									<span className="text-ellipsis overflow-hidden whitespace-nowrap">
										{project.name}
									</span>
								</SideMenuLink>
							))}
						</>
					)}
				</div>

				<div className="flex flex-row justify-start items-center w-full">
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full justify-between flex flex-row group px-2 text-muted-foreground"
								variant="ghost"
								size="sm"
							>
								<div className="flex flex-row justify-center items-center gap-x-2">
									<UserAvatar
										size="sm"
										profileImageUrl={actorUser.profileImageUrl}
										name={actorUser.fullName}
									/>
									<p className="text-sm font-medium">{actorUser.fullName}</p>
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" container={documentBody}>
							<DropdownMenuItem asChild>
								<a href="https://docs.tunnel.dev" target="_blank">
									<Book size={14} />
									Documentation
								</a>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<a href={DISCORD_URL} target="_blank">
									<HelpCircle size={14} />
									Support
								</a>
							</DropdownMenuItem>
							<div className="w-full h-[1px] bg-input my-2"></div>
							<DropdownMenuItem
								onClick={async () => {
									signOut();
									window.location.href = '/login';
								}}
								danger
							>
								<LogOut size={14} />
								Sign out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}

const SideMenuLink = ({
	children,
	isActive,
	href,
}: {
	children: React.ReactNode;
	isActive: boolean;
	href: string;
}) => (
	<Link
		href={href}
		className={cn(
			buttonVariants({
				variant: 'ghost',
				className: 'font-normal gap-x-2 text-muted-foreground',
			}),
			isActive && '!bg-accent text-foreground [&>svg]:!text-foreground',
			'w-full flex flex-row justify-start items-center !px-2',
		)}
	>
		{children}
	</Link>
);
