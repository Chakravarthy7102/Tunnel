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
} from '@-/database/selections';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@-/design-system/v1';
import { OrganizationAvatar } from '@-/organization/components';
import { toast } from '@-/tunnel-error';
import { LogOut, Mail, MoreHorizontal, Trash2, X } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState } from 'react';

interface OrganizationPeopleCardProps {
	actorUser: ServerDoc<'User'>;
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$commentsProviderData
	>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setOrganization: Dispatch<
		SetStateAction<ServerDoc<typeof Organization_$dashboardPageData>>
	>;
	organizationMembers: ServerDoc<
		typeof OrganizationMember_$userData
	>[];
	setOrganizationMembers: Dispatch<
		SetStateAction<
			ServerDoc<
				typeof OrganizationMember_$userData
			>[]
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

export function OrganizationPeopleCard(props: OrganizationPeopleCardProps) {
	const [tab, setTab] = useState<'members' | 'invitations'>('members');

	return (
		<DashboardCard
			title="Organization Members"
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
					<OrganizationMembersTab {...props} /> :
					<OrganizationInvitationsTab {...props} />}
			</div>
		</DashboardCard>
	);
}

function OrganizationMembersTab(props: OrganizationPeopleCardProps) {
	const { organizationMembers } = props;
	const roleOrder: Record<string, number> = {
		owner: 0,
		admin: 1,
		member: 2,
	};
	const sortedOrganizationMembers = [...organizationMembers].sort(
		(a, b) => (roleOrder[a.role] ?? 0) - (roleOrder[b.role] ?? 0),
	);

	return sortedOrganizationMembers.map((organizationMember) => (
		<OrganizationMemberListing
			key={organizationMember._id}
			organizationMember={organizationMember}
			{...props}
		/>
	));
}

function OrganizationInvitationsTab(props: OrganizationPeopleCardProps) {
	const { organizationInvitations } = props;

	if (organizationInvitations.length === 0) {
		return (
			<div className="px-4 py-8 flex flex-col justify-center items-center gap-y-3">
				<p className="text-muted-foreground">No invitations yet</p>
				<Mail size={48} className="text-muted-foreground" />
			</div>
		);
	}

	const sortedInvitations = [...organizationInvitations].sort((a, b) =>
		b._creationTime - a._creationTime
	);

	return (
		sortedInvitations.map((invitation) => (
			<OrganizationInvitationListing
				key={invitation._id}
				organizationInvitation={invitation}
				{...props}
			/>
		))
	);
}

function OrganizationMemberListing(
	props: OrganizationPeopleCardProps & {
		organizationMember: ServerDoc<typeof OrganizationMember_$userData>;
	},
) {
	const updateOrganizationMemberRole = trpc.organizationMember.updateRole
		.useMutation();
	const documentBody = useDocumentBody();
	const {
		organization,
		organizationMember,
		setOrganizationMembers,
		actorUser,
		actorOrganizationMember,
	} = props;

	return (
		<div className="flex flex-row justify-between items-center w-full gap-x-4 p-4 border-solid border-b border-input last:border-none">
			<div className="flex flex-row justify-center items-center gap-x-3">
				<OrganizationAvatar
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
				<Select
					defaultValue={organizationMember.role}
					disabled={organizationMember.role === 'owner' ||
						actorOrganizationMember.role === 'member'}
					onValueChange={async (value) => {
						if (value === 'admin') {
							setOrganizationMembers((previousOrganizationMembers) =>
								previousOrganizationMembers.map((previousOrganizationMember) =>
									previousOrganizationMember._id === organizationMember._id ?
										{ ...previousOrganizationMember, role: 'admin' } :
										organizationMember
								)
							);

							const result = await updateOrganizationMemberRole.mutateAsync(
								{
									actor: {
										type: 'User',
										data: { id: actorUser._id },
									},
									organizationMember: {
										id: organizationMember._id,
									},
									newRole: 'admin',
								},
							);

							if (result.isErr()) {
								toast.procedureError(result);
								return;
							}

							toast.ORGANIZATION_ROLE_UPDATE_SUCCESS();
						} else if (value === 'member') {
							setOrganizationMembers((previousOrganizationMembers) =>
								previousOrganizationMembers.map((previousOrganizationMember) =>
									previousOrganizationMember._id === organizationMember._id ?
										{ ...previousOrganizationMember, role: 'member' } :
										previousOrganizationMember
								)
							);

							const result = await updateOrganizationMemberRole.mutateAsync(
								{
									actor: {
										type: 'User',
										data: { id: actorUser._id },
									},
									organizationMember: {
										id: organizationMember._id,
									},
									newRole: 'member',
								},
							);

							if (result.isErr()) {
								toast.procedureError(result);
								return;
							}

							toast.ORGANIZATION_ROLE_UPDATE_SUCCESS();
						}
					}}
				>
					<SelectTrigger className="flex flex-row justify-between items-center w-full gap-x-2">
						{organizationMember.role === 'owner' ?
							'Owner' :
							organizationMember.role === 'guest' ?
							'Guest' :
							<SelectValue placeholder="" />}
					</SelectTrigger>
					<SelectContent container={documentBody}>
						<SelectItem value="admin">Admin</SelectItem>
						<SelectItem value="member">Member</SelectItem>
					</SelectContent>
				</Select>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="icon"
							variant="ghost"
							disabled={(actorUser._id !== organizationMember.user._id &&
								actorOrganizationMember.role === 'member') ||
								(actorUser._id === organizationMember.user._id &&
									actorOrganizationMember.role === 'owner') ||
								(actorOrganizationMember.role === 'admin' &&
									organizationMember.role === 'owner') ||
								(actorOrganizationMember.role === 'admin' &&
									organizationMember.role === 'admin')}
						>
							<MoreHorizontal size={14} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent container={documentBody}>
						{actorOrganizationMember.role !== 'member' &&
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

function OrganizationInvitationListing(
	props: OrganizationPeopleCardProps & {
		organizationInvitation: ServerDoc<
			typeof OrganizationInvitation_$dashboardPageData
		>;
	},
) {
	const revokeOrganizationInvitation = trpc.organization.revokeInvitation
		.useMutation();
	const documentBody = useDocumentBody();
	const {
		organizationInvitation,
		setOrganizationInvitations,
		actorUser,
		actorOrganizationMember,
	} = props;

	return (
		<div className="flex flex-row justify-between items-center w-full gap-x-4 p-4 border-solid border-b border-input last:border-none">
			<div className="flex flex-row justify-center items-center gap-x-3">
				<OrganizationAvatar
					profileImageUrl={organizationInvitation.recipientUser
						?.profileImageUrl ?? null}
					name={organizationInvitation.recipientUser?.fullName ??
						organizationInvitation.recipientEmailAddress ?? 'Unknown User'}
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
									setOrganizationInvitations((previousInvitations) =>
										previousInvitations.filter((previousInvitation) =>
											previousInvitation._id !== organizationInvitation._id
										)
									);

									const result = await revokeOrganizationInvitation
										.mutateAsync(
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
								Cancel invitation
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
