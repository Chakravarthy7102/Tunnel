import { DashboardCard } from '#components/v1/cards/card.tsx';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type { Project_$dashboardPageData } from '@-/database/selections';
import {
	Button,
	Input,
} from '@-/design-system/v1';
import type { OrganizationInvitation_$dashboardPageData } from '@-/organization-invitation/selections';
import type { Organization_$dashboardPageData } from '@-/organization/selections';
import { toast } from '@-/tunnel-error';
import { createId } from '@paralleldrive/cuid2';
import { Trash2 } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState } from 'react';

export function NewProjectInvitationsCard({
	actorUser,
	organization,
	project,
	setOrganizationInvitations,
}: {
	actorUser: ServerDoc<'User'>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	project: ServerDoc<typeof Project_$dashboardPageData>;
	setOrganizationInvitations: Dispatch<
		SetStateAction<
			ServerDoc<typeof OrganizationInvitation_$dashboardPageData>[]
		>
	>;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const sendInvitations = trpc.organization.sendInvitations.useMutation();
	const [newOrganizationInvitations, setNewOrganizationInvitations] = useState<
		{
			role: 'guest';
			emailAddress: string;
			key: string;
		}[]
	>([
		{
			role: 'guest',
			key: createId(),
			emailAddress: '',
		},
	]);

	const validateEmails = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return newOrganizationInvitations.every((invitation) =>
			emailRegex.test(invitation.emailAddress)
		);
	};

	return (
		<DashboardCard
			title="Invite people"
			button={
				<Button
					// dprint-ignore
					disabled={
						newOrganizationInvitations.filter((newOrganizationInvitation) =>
							newOrganizationInvitation.emailAddress.length > 0,
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
									({ role, emailAddress }) => ({
										role,
										emailAddress,
										authorizedProject: {
											id: project._id,
										},
									}),
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
							role: 'guest',
							key: createId(),
							emailAddress: '',
						}]);
						setOrganizationInvitations((previousOrganizationInvitations) => [
							...previousOrganizationInvitations,
							...result.value,
						]);
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
						gridTemplateColumns: '3fr auto',
					}}
					className="grid gap-x-4 mb-2 w-full"
				>
					<label className="text-sm text-muted-foreground w-full">Email</label>

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
								gridTemplateColumns: '3fr auto',
							}}
						>
							<Input
								type="email"
								value={newOrganizationInvitation.emailAddress}
								onChange={(e) => {
									setNewOrganizationInvitations((
										previousNewOrganizationInvitations,
									) =>
										previousNewOrganizationInvitations.map(
											(previousNewOrganizationInvitation) =>
												previousNewOrganizationInvitation.key ===
														newOrganizationInvitation.key ?
													{
														...previousNewOrganizationInvitation,
														emailAddress: e.target.value,
													} :
													previousNewOrganizationInvitation,
										)
									);
								}}
								placeholder="email@example.com"
							/>

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

							setNewOrganizationInvitations(
								(previousNewOrganizationInvitations) => [
									...previousNewOrganizationInvitations,
									{
										role: 'guest',
										key: createId(),
										emailAddress: '',
									},
								],
							);
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
