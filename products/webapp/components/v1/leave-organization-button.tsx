'use client';

import { useDocumentBody } from '#utils/document.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	OrganizationMember_$userData,
	User_$profileData,
} from '@-/database/selections';
import {
	Button,
	type ButtonProps,
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { Loader2 } from 'lucide-react';
import { type ReactNode, useState } from 'react';

export function LeaveOrganizationButton({
	actorUser,
	organization,
	organizationMember,
	children,
}: ButtonProps & {
	actorUser: ServerDoc<typeof User_$profileData>;
	organization: ServerDoc<'Organization'>;
	organizationMember: ServerDoc<typeof OrganizationMember_$userData>;
	children: ReactNode;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const leaveOrganization = trpc.organizationMember.leave.useMutation();

	const documentBody = useDocumentBody();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent container={documentBody}>
				<DialogHeader>
					<DialogTitle>Leave '{organization.name}'</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<DialogDescription>
						Are you sure you want to leave{' '}
						<b>{organization.name}</b>? You won't be able to rejoin this
						organization unless you are re-invited.
					</DialogDescription>
				</DialogBody>

				<DialogFooter>
					<Button
						className="mt-4"
						variant="destructive"
						isLoading={isLoading}
						onClick={async () => {
							setIsLoading(true);
							const result = await leaveOrganization.mutateAsync(
								{
									actor: {
										type: 'User',
										data: { id: actorUser._id },
									},
									organizationMember: {
										id: organizationMember._id,
									},
								},
							);

							setIsLoading(false);

							if (result.isErr()) {
								toast.procedureError(result);
								return;
							}

							window.location.href = '/home';
						}}
					>
						{isLoading ? <Loader2 className="animate-spin" /> : (
							'Leave this organization'
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
