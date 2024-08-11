'use client';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarItemGroup,
	SidebarLabel,
} from '#components/dashboard/ui/sidebar.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useAuth } from '#utils/auth.client.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { api, ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$userData,
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DropdownMenu,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	LinkButton,
	Logo,
	LogoImage,
} from '@-/design-system';
import { Badge } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { z } from '@-/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ChevronsUpDown,
	CreditCard,
	Home,
	Inbox,
	LogOut,
	Plus,
	Settings,
	SquareKanban,
	UserCircle2,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
	type Dispatch,
	type SetStateAction,
	useState,
} from 'react';
import { useForm } from 'react-hook-form';

export function MainSidebar({
	preloadedActorOrganizationMember,
}: {
	preloadedActorOrganizationMember: NonNullPreloaded<
		typeof api.v.OrganizationMember_get_actorProfileData
	>;
}) {
	const [actorOrganizationMember] = usePreloadedQueryState(
		preloadedActorOrganizationMember,
	);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, projects, setProjects } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const pathname = usePathname();

	if (!actorOrganizationMember) {
		return null;
	}

	return (
		<Sidebar>
			<div className="flex flex-col w-full p-3">
				<OrganizationSwitcher />
			</div>
			<SidebarGroup className="mt-0">
				<SidebarItemGroup>
					<SidebarItem
						href={`/${organization.slug}`}
						active={pathname === `/${organization.slug}`}
					>
						<Home size={16} />
						Home
					</SidebarItem>
					<SidebarItem
						href={`/${organization.slug}/inbox`}
						active={pathname === `/${organization.slug}/inbox`}
					>
						<Inbox size={16} />
						Inbox
					</SidebarItem>
				</SidebarItemGroup>
			</SidebarGroup>
			<SidebarGroup>
				<div className="flex flex-row justify-between items-center">
					<SidebarLabel>Projects</SidebarLabel>
					<NewProjectButton
						organization={organization}
						actorUser={actorUser}
						actorOrganizationMember={actorOrganizationMember}
						setProjects={setProjects}
					/>
				</div>
				<SidebarItemGroup>
					{projects.map((project) => (
						<SidebarItem
							key={project._id}
							href={`/${organization.slug}/projects/${project.slug}`}
							active={pathname.includes(project.slug)}
						>
							<SquareKanban size={16} />
							<p>{project.name}</p>
						</SidebarItem>
					))}
				</SidebarItemGroup>
			</SidebarGroup>
		</Sidebar>
	);
}

function OrganizationSwitcher() {
	const {
		actorUser,
		actorOrganizationMembers,
	} = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const documentBody = useDocumentBody();
	const { signOut } = useAuth();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button className="flex flex-row w-[240px] justify-between items-center p-2 gap-x-3 border border-white/10 rounded-[10px] shadow-v2-button-important transition-colors">
					<div className="flex flex-row justify-center items-center gap-x-2">
						<Logo>
							<LogoImage src={organization.profileImageUrl ?? ''} />
						</Logo>
						<div className="flex flex-col items-start gap-y-1">
							<p className="text-xs text-v2-soft-400">
								Organization
							</p>
							<div className="flex flex-row justify-start items-center gap-x-1">
								<p className="text-sm line-clamp-1 text-left font-medium">
									{organization.name}
								</p>
								<Badge
									variant={'v2-default'}
									size={'xs'}
								>
									{organization.subscriptionPlan.charAt(0).toUpperCase() +
										organization.subscriptionPlan.slice(1)}
								</Badge>
							</div>
						</div>
					</div>

					<ChevronsUpDown size={16} className="text-muted-foreground" />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				container={documentBody}
				align="start"
				className="w-[240px] min-w-[240px]"
			>
				<DropdownMenu.Label>Account</DropdownMenu.Label>
				<DropdownMenu.Item asChild>
					<Link href={`/${organization.slug}/settings/profile`}>
						<UserCircle2 size={16} />
						Profile
					</Link>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Label>Organization</DropdownMenu.Label>
				<DropdownMenu.Item asChild>
					<Link href={`/${organization.slug}/settings`}>
						<Settings size={16} />
						Organization settings
					</Link>
				</DropdownMenu.Item>
				<DropdownMenu.Item asChild>
					<Link href={`/${organization.slug}/settings/members`}>
						<Users size={16} />
						Invite and manage members
					</Link>
				</DropdownMenu.Item>
				<DropdownMenu.Item asChild>
					<Link href={`/${organization.slug}/settings/billing`}>
						<CreditCard size={16} />
						Plan & billing
					</Link>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>
						<ChevronsUpDown size={16} />
						Switch organizations
					</DropdownMenu.SubTrigger>
					<DropdownMenu.Portal>
						<DropdownMenu.SubContent>
							<DropdownMenu.Label>{actorUser.email}</DropdownMenu.Label>
							<DropdownMenu.Group>
								{actorOrganizationMembers.map((actorOrganizationMember) => (
									<DropdownMenu.Item
										key={actorOrganizationMember.organization.slug}
										asChild
									>
										<Link
											href={`/${actorOrganizationMember.organization.slug}`}
										>
											<div className="flex flex-row items-center gap-x-2">
												<Logo size="xs">
													<LogoImage
														src={organization.profileImageUrl ?? ''}
													/>
												</Logo>
												<p>{actorOrganizationMember.organization.name}</p>
											</div>
										</Link>
									</DropdownMenu.Item>
								))}
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Item asChild>
								<Link href={`/join`}>
									<Plus size={16} />
									Create or join an organization
								</Link>
							</DropdownMenu.Item>
						</DropdownMenu.SubContent>
					</DropdownMenu.Portal>
				</DropdownMenu.Sub>
				<DropdownMenu.Item
					onClick={async () => {
						signOut();
						window.location.href = '/login';
					}}
					danger
				>
					<LogOut size={16} />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	);
}

function NewProjectButton({
	organization,
	actorUser,
	actorOrganizationMember,
	setProjects,
}: {
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	actorUser: ServerDoc<typeof User_$profileData>;
	actorOrganizationMember: ServerDoc<typeof OrganizationMember_$userData>;
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
}) {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const projectSchema = z.object({
		name: z.string().min(1, 'Provide a name for your project'),
	});
	const form = useForm<z.infer<typeof projectSchema>>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: '',
		},
	});

	const createProject = trpc.project.create$dashboardPageData.useMutation();
	const router = useRouter();
	async function onSubmit(values: z.infer<typeof projectSchema>) {
		const result = await createProject.mutateAsync({
			name: values.name,
			githubRepository: null,
			gitlabProject: null,
			shouldLinkGithubRepository: false,
			actor: { type: 'User', data: { id: actorUser._id } },
			ownerOrganization: { id: organization._id },
			organizationMember: { id: actorOrganizationMember._id },
		});

		if (result.isErr()) {
			toast.procedureError(result);
			return;
		}

		toast.CREATE_PROJECT_SUCCESS();
		setProjects((projects) => [...projects, result.value]);
		router.push(`/${organization.slug}/projects/${result.value.slug}`);
		setIsDialogOpen(false);
		form.reset();
	}

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<LinkButton
					variant="tertiary"
					size="xs"
					className="mr-2"
				>
					<Plus size={14} />
					New project
				</LinkButton>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader className="justify-between">
					<DialogTitle>Create a new project</DialogTitle>
					<DialogClose />
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col items-start gap-y-4 p-4 bg-v2-neutral-700">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Project name</FormLabel>
										<FormControl>
											<Input
												{...field}
												hasError={form.formState.errors.name !==
													undefined}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button size="sm" type="submit">Create project</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
