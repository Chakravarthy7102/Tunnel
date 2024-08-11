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
import { type ReactNode, useState } from 'react';

export function RemoveUserButton({
	organizationMember,
	actorUser,
	children,
	onCompleted,
}: ButtonProps & {
	organizationMember: ServerDoc<typeof OrganizationMember_$userData>;
	actorUser: ServerDoc<typeof User_$profileData>;
	children: ReactNode;
	onCompleted: () => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const removeOrganizationMember = trpc.organizationMember.remove.useMutation();

	const documentBody = useDocumentBody();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>

			<DialogContent container={documentBody}>
				<DialogHeader>
					<DialogTitle>Remove '{organizationMember.user.fullName}'</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<DialogDescription>
						Are you sure you want to remove{' '}
						<b>{organizationMember.user.fullName}</b>? They won't be able to
						rejoin this organization unless they are re-invited.
					</DialogDescription>
				</DialogBody>

				<DialogFooter>
					<Button
						className="mt-4"
						variant="destructive"
						isLoading={isLoading}
						onClick={async () => {
							setIsLoading(true);

							const result = await removeOrganizationMember.mutateAsync(
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

							onCompleted();
							toast.REMOVE_ORGANIZATION_MEMBER_SUCCESS();
						}}
					>
						Remove this user
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
