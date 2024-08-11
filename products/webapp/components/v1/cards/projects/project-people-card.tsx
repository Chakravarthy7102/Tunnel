import { DashboardCard } from '#components/v1/cards/card.tsx';
import { LeaveOrganizationButton } from '#components/v1/leave-organization-button.tsx';
import { NavigationButton } from '#components/v1/navigation-button.tsx';
import { RemoveUserButton } from '#components/v1/remove-user-button.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationInvitation_$dashboardPageData,
	OrganizationMember_$commentsProviderData,
	OrganizationMember_$userData,
	Project_$dashboardPageData,
} from '@-/database/selections';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { UserAvatar } from '@-/user/components';
import { LogOut, Mail, MoreHorizontal, Trash2, X } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState } from 'react';

interface ProjectPeopleCardProps {
	actorUser: ServerDoc<'User'>;
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$commentsProviderData
	>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setOrganization: Dispatch<
		SetStateAction<ServerDoc<typeof Organization_$dashboardPageData>>
	>;
	project: ServerDoc<typeof Project_$dashboardPageData>;
	organizationMembers: ServerDoc<
		typeof OrganizationMember_$userData
	>[];
	setOrganizationMembers: Dispatch<
		SetStateAction<
			ServerDoc<typeof OrganizationMember_$userData>[]
		>
	>;
	organizationInvitations: ServerDoc<
		typeof OrganizationInvitation_$dashboardPageData
	>[];
	setOrganizationInvitations: Dispatch<
		SetStateAction<
			ServerDoc<typeof OrganizationInvitation_$dashboardPageData>[]
		>
	>;
}

export function ProjectPeopleCard(props: ProjectPeopleCardProps) {
	const [tab, setTab] = useState<'members' | 'invitations'>('members');

	return (
		<DashboardCard
			title={'Project Members'}
			isPadded={false}
		>
			<div className="flex flex-row justify-start items-center gap-x-2 p-4 border-solid border-b border-input w-full">
				<NavigationButton
					link={false}
					isActive={tab === 'members'}
					onClick={() => setTab('members')}
				>
					Members
				</NavigationButton>
				<NavigationButton
					link={false}
					isActive={tab === 'invitations'}
					onClick={() => setTab('invitations')}
				>
					Invitations
				</NavigationButton>
			</div>

			<div className="flex flex-col justify-center items-center w-full">
				{tab === 'members' ?
					<ProjectMembersTab {...props} /> :
					<ProjectInvitationsTab {...props} />}
			</div>
		</DashboardCard>
	);
}

function ProjectMembersTab(props: ProjectPeopleCardProps) {
	const { organizationMembers } = props;
	const sortedOrganizationMembers = [...organizationMembers].sort((a, b) => {
		const roleOrder: Record<string, number> = {
			owner: 0,
			admin: 1,
			member: 2,
		};

		return (roleOrder[a.role] ?? 0) - (roleOrder[b.role] ?? 0);
	});

	return sortedOrganizationMembers.map((organizationMember) => (
		<ProjectMemberListing
			key={organizationMember._id}
			organizationMember={organizationMember}
			{...props}
		/>
	));
}

function ProjectInvitationsTab(props: ProjectPeopleCardProps) {
	const { organizationInvitations } = props;
	if (organizationInvitations.length === 0) {
		return (
			<div className="px-4 py-8 flex flex-col justify-center items-center gap-y-3">
				<p className="text-muted-foreground">No invitations yet</p>
				<Mail size={48} className="text-muted-foreground" />
			</div>
		);
	}

	const sortedOrganizationInvitations = [...organizationInvitations].sort(
		(a, b) => b._creationTime - a._creationTime,
	);

	return sortedOrganizationInvitations.map((organizationInvitation) => (
		<ProjectInvitationListing
			key={organizationInvitation._id}
			organizationInvitation={organizationInvitation}
			{...props}
		/>
	));
}

function ProjectMemberListing(
	props: ProjectPeopleCardProps & {
		organizationMember: ServerDoc<
			typeof OrganizationMember_$userData
		>;
	},
) {
	const {
		actorUser,
		setOrganizationMembers,
		organization,
		organizationMember,
	} = props;
	const documentBody = useDocumentBody();

	return (
		<div className="flex flex-row justify-between items-center w-full gap-x-4 p-4 border-solid border-b border-input last:border-none">
			<div className="flex flex-row justify-center items-center gap-x-3">
				<UserAvatar
					profileImageUrl={organizationMember.user.profileImageUrl}
					name={organizationMember.user.fullName}
				/>
				<div className="flex flex-col justify-center items-start">
					<p className="text-sm">{organizationMember.user.fullName}</p>
					<p className="text-[12px] text-muted-foreground">
						{organizationMember.user.email}
					</p>
				</div>
			</div>

			<div className="flex flex-row justify-center items-center gap-3 mr-1">
				<p className="text-muted-foreground text-sm">
					{organizationMember.role.charAt(0).toUpperCase() +
						organizationMember.role.slice(1)}
				</p>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							disabled={(actorUser._id !== organizationMember.user._id &&
								props.actorOrganizationMember.role === 'member') ||
								(actorUser._id === organizationMember.user._id &&
									props.actorOrganizationMember.role === 'owner') ||
								(props.actorOrganizationMember.role === 'admin' &&
									organizationMember.role === 'owner') ||
								(props.actorOrganizationMember.role === 'admin' &&
									organizationMember.role === 'admin') ||
								organizationMember.role !== 'guest' ||
								props.actorOrganizationMember.role === 'guest'}
						>
							<MoreHorizontal size={14} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent container={documentBody}>
						{props.actorOrganizationMember.role !== 'member' &&
							props.actorOrganizationMember.role !== 'guest' &&
							actorUser._id !== organizationMember.user._id && (
							<RemoveUserButton
								organizationMember={organizationMember}
								actorUser={actorUser}
								onCompleted={() => {
									setOrganizationMembers((previousOrganizationMembers) =>
										previousOrganizationMembers.filter(
											(previousOrganizationMember) =>
												previousOrganizationMember._id !==
													organizationMember._id,
										)
									);
								}}
							>
								<DropdownMenuItem
									onSelect={(e) => e.preventDefault()}
									danger
								>
									<Trash2 size={14} />
									Remove user
								</DropdownMenuItem>
							</RemoveUserButton>
						)}

						{actorUser._id === organizationMember.user._id && (
							<LeaveOrganizationButton
								actorUser={actorUser}
								organization={organization}
								organizationMember={organizationMember}
							>
								<DropdownMenuItem
									danger
									onSelect={(e) => e.preventDefault()}
								>
									<LogOut size={14} /> Leave organization
								</DropdownMenuItem>
							</LeaveOrganizationButton>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

function ProjectInvitationListing(
	props: ProjectPeopleCardProps & {
		organizationInvitation: ServerDoc<
			typeof OrganizationInvitation_$dashboardPageData
		>;
	},
) {
	const {
		actorOrganizationMember,
		actorUser,
		organizationInvitation,
		setOrganizationInvitations,
	} = props;
	const revokeOrganizationInvitation = trpc.organization.revokeInvitation
		.useMutation();
	const documentBody = useDocumentBody();

	return (
		<div className="flex flex-row justify-between items-center w-full gap-x-4 p-4 border-solid border-b border-input last:border-none">
			<div className="flex flex-row justify-center items-center gap-x-3">
				<UserAvatar
					profileImageUrl={organizationInvitation.recipientUser
						?.profileImageUrl ?? null}
					name={organizationInvitation.recipientUser?.fullName ??
						organizationInvitation.recipientEmailAddress ?? ''}
				/>
				<div className="flex flex-col justify-center items-start">
					<p className="text-sm">
						{organizationInvitation.recipientUser?.email ??
							organizationInvitation.recipientEmailAddress}
					</p>
					<p className="text-[12px] text-muted-foreground">Pending</p>
				</div>
			</div>

			<div className="flex flex-row justify-center items-center gap-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							disabled={actorOrganizationMember.role === 'guest'}
						>
							<MoreHorizontal size={14} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent container={documentBody} align="end">
						{actorOrganizationMember.role !== 'member' && (
							<DropdownMenuItem
								onClick={async () => {
									setOrganizationInvitations((
										previousOrganizationInvitations,
									) =>
										previousOrganizationInvitations.filter((
											previousOrganizationInvitation,
										) =>
											previousOrganizationInvitation._id !==
												organizationInvitation._id
										)
									);

									const result = await revokeOrganizationInvitation.mutateAsync(
										{
											actor: {
												type: 'User',
												data: { id: actorUser._id },
											},
											organizationInvitation: {
												id: organizationInvitation._id,
											},
										},
									);

									if (result.isErr()) {
										toast.procedureError(result);
										return;
									}

									toast.CANCEL_INVITATION_SUCCESS();
								}}
								danger
							>
								<X size={14} />
								Revoke invitation
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
