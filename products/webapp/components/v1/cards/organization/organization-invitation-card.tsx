import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$dashboardPageData,
} from '@-/database/selections';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { createId } from '@paralleldrive/cuid2';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NewOrganizationInvitationsCard({
	actorUser,
	actorOrganizationMember,
	organization,
}: {
	actorUser: ServerDoc<'User'>;
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$dashboardPageData
	>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const sendInvitations = trpc.organization.sendInvitations.useMutation();
	const documentBody = useDocumentBody();
	const [newOrganizationInvitations, setNewOrganizationInvitations] = useState<
		{
			role: 'member' | 'admin';
			emailAddress: string;
			key: string;
		}[]
	>([
		{
			role: 'member',
			key: createId(),
			emailAddress: '',
		},
	]);

	const validateEmails = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return newOrganizationInvitations.every((organizationInvitation) =>
			emailRegex.test(organizationInvitation.emailAddress)
		);
	};

	return (
		<DashboardCard
			title="Invite people"
			button={
				<Button
					// dprint-ignore
					disabled={
							newOrganizationInvitations.filter(
								(newOrganizationInvitation) => newOrganizationInvitation.emailAddress.length > 0,
							).length === 0 ||
							!validateEmails()
						}
					onClick={async () => {
						if (!validateEmails()) return;
						setIsLoading(true);
						const result = await sendInvitations.mutateAsync(
							{
								actor: { type: 'User', data: { id: actorUser._id } },
								senderUser: {
									id: actorUser._id,
								},
								invitations: newOrganizationInvitations.map(
									({ role, emailAddress }) => ({ role, emailAddress }),
								),
								organization: {
									id: organization._id,
								},
							},
						);
						setIsLoading(false);

						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						toast.SEND_INVITATIONS_SUCCESS();
						setNewOrganizationInvitations([{
							role: 'member',
							key: createId(),
							emailAddress: '',
						}]);
					}}
					isLoading={isLoading}
				>
					Invite
				</Button>
			}
		>
			<div className="flex flex-col w-full">
				<div
					style={{
						gridTemplateColumns: '3fr 1fr auto',
					}}
					className="grid gap-x-4 mb-2 w-full"
				>
					<label className="text-sm text-muted-foreground w-full">Email</label>
					<label className="text-sm text-muted-foreground w-full">Role</label>
					<div
						style={{
							width: '24px',
							height: '100%',
						}}
					>
					</div>
				</div>

				<div className="flex flex-col justify-center items-center w-full gap-y-1 mb-4">
					{newOrganizationInvitations.map((newOrganizationInvitation) => (
						<div
							key={newOrganizationInvitation.key}
							className="grid w-full gap-x-4 group"
							style={{
								gridTemplateColumns: '3fr 1fr auto',
							}}
						>
							<Input
								type="email"
								value={newOrganizationInvitation.emailAddress}
								onChange={(e) => {
									setNewOrganizationInvitations((
										previousNewOrganizationInvitations,
									) =>
										previousNewOrganizationInvitations.map((
											previousNewOrganizationInvitation,
										) =>
											previousNewOrganizationInvitation.key ===
													newOrganizationInvitation.key ?
												{
													...previousNewOrganizationInvitation,
													emailAddress: e.target.value,
												} :
												previousNewOrganizationInvitation
										)
									);
								}}
								placeholder="user@example.com"
							/>

							<div className="flex flex-col justify-start items-start">
								<Select
									onValueChange={(role) => {
										setNewOrganizationInvitations((
											previousNewOrganizationInvitations,
										) =>
											previousNewOrganizationInvitations.map((
												previousNewOrganizationInvitation,
											) =>
												previousNewOrganizationInvitation.key ===
														newOrganizationInvitation.key ?
													{
														...previousNewOrganizationInvitation,
														role: role as 'member' | 'admin',
													} :
													previousNewOrganizationInvitation
											)
										);
									}}
									defaultValue="member"
								>
									<SelectTrigger className="flex flex-row justify-between items-center w-full gap-x-2">
										<SelectValue placeholder="" />
									</SelectTrigger>
									<SelectContent className="w-full" container={documentBody}>
										{actorOrganizationMember.role === 'owner' && (
											<SelectItem
												value="admin"
												className="flex flex-row justify-between items-center w-full"
											>
												Admin
											</SelectItem>
										)}

										<SelectItem
											value="member"
											className="flex flex-row justify-between items-center w-full"
										>
											Member
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="flex justify-center items-center h-full text-muted-foreground">
								<Button
									variant="ghost"
									size="icon"
									disabled={newOrganizationInvitations.length === 1}
									onClick={() => {
										setNewOrganizationInvitations((
											previousNewOrganizationInvitations,
										) =>
											previousNewOrganizationInvitations.filter((
												previousNewOrganizationInvitation,
											) =>
												previousNewOrganizationInvitation.key !==
													newOrganizationInvitation.key
											)
										);
									}}
								>
									<Trash2 size={14} />
								</Button>
							</div>
						</div>
					))}
				</div>

				<div className="grid grid-cols-4">
					<Button
						variant="blue"
						onClick={() => {
							if (!validateEmails()) {
								return;
							}

							setNewOrganizationInvitations((
								previousNewOrganizationInvitations,
							) => [
								...previousNewOrganizationInvitations,
								{
									role: 'member',
									key: createId(),
									emailAddress: '',
								},
							]);
						}}
						className="col-span-1"
					>
						Add another
					</Button>
				</div>
			</div>
		</DashboardCard>
	);
}
