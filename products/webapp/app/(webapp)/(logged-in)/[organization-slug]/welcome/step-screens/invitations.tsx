'use client';

import { MuratCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/murat-card.tsx';
import type { StepScreenProps } from '#types';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { Button, MuratTextarea } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useState } from 'react';

export function InvitationsStepScreen(
	{ onContinue, organization }: StepScreenProps,
) {
	const [isLoading, setIsLoading] = useState(false);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');

	const [input, setInput] = useState('');

	const sendInvitations = trpc.organization.sendInvitations.useMutation();

	function validateEmails(input: string) {
		const emails = input.split(',');
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		for (let email of emails) {
			email = email.trim();
			if (!emailRegex.test(email)) {
				return false;
			}
		}

		return true;
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { value } = e.target;

		setInput(value);
	};

	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Tunnel is better together!
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					Tunnel is meant to be used with your team. Invite some teammates to
					use Tunnel with.
				</p>
			</div>

			<MuratCard className="p-4 flex flex-col justify-center items-start w-full max-w-md gap-y-4">
				<p className="text-sm font-medium text-neutral-200 text-left">
					Invite teammates to join this workspace
				</p>
				<MuratTextarea
					value={input}
					onChange={handleInputChange}
					placeholder="email@example.com, ..."
				/>
				<Button
					variant="muratblue"
					className="w-full"
					disabled={input.split(',').filter((email) => email.trim().length > 0)
								.length === 0 || !validateEmails(input)}
					onClick={async () => {
						if (!validateEmails(input)) return;
						setIsLoading(true);
						const result = await sendInvitations.mutateAsync(
							{
								actor: { type: 'User', data: { id: actorUser._id } },
								senderUser: {
									id: actorUser._id,
								},
								invitations: input.split(',').map((email) => ({
									role: 'member',
									emailAddress: email.trim(),
								})),
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
						setInput('');
						onContinue();
					}}
					isLoading={isLoading}
				>
					Send invitations
				</Button>
				{
					/* {organization.invite !== null && organization.invite.id !== null &&
					(
						<>
							<div className="w-full h-[0.5px] bg-[#ffffff10]" />
							<div className="flex flex-row justify-between gap-x-2 items-center h-8 px-2 w-full rounded-[8px] border border-solid border-[#ffffff10] bg-neutral-600 overflow-hidden">
								<div className="flex flex-row justify-center items-center gap-2 w-full overflow-hidden">
									<Link size={14} className="text-neutral-400" />
									<p className="text-sm font-normal text-neutral-300 text-ellipsis overflow-hidden whitespace-nowrap w-full">
										https://tunnel.dev/invite/{organization.invite.id}
									</p>
								</div>
								<button
									onClick={async () => {
										await navigator.clipboard.writeText(
											`https://tunnel.dev/invite/${organization.invite.id}`,
										);
										toast.COPY_CLIPBOARD_SUCCESS();
									}}
									className="text-xs font-medium hover:underline min-w-max text-neutral-0"
								>
									Copy link
								</button>
							</div>
						</>
					)} */
				}
			</MuratCard>
			<button
				onClick={onContinue}
				className="text-sm font-medium hover:underline min-w-max"
			>
				I'll invite teammates later
			</button>
		</div>
	);
}
