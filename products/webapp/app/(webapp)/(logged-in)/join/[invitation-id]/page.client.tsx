'use client';

import type {
	organizationInvitationSelect,
} from '#app/(webapp)/(logged-in)/join/select.ts';
import { Card } from '#components/v1/cards/card.tsx';
import { useAuth } from '#utils/auth.client.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import {
	Avatar,
	AvatarImage,
	Button,
	buttonVariants,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { ApiUrl } from '@-/url/api';
import { UserAvatar } from '@-/user/components';
import { LogOut, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function JoinClientPage({
	organizationInvitation,
}: {
	organizationInvitation: ServerDoc<
		typeof organizationInvitationSelect
	>;
}) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const mutateAcceptOrganizationInvitation = trpc.organization.acceptInvitation
		.useMutation();

	const [loadingInvitation, setLoadingInvitation] = useState<string | null>(
		null,
	);

	const { signOut } = useAuth();
	const documentBody = useDocumentBody();

	// Verify that the user was the intended recipient of the invitation
	if (
		(
			organizationInvitation.recipientUser !== null &&
			organizationInvitation.recipientUser._id !== actorUser._id
		) ||
		(
			organizationInvitation.recipientEmailAddress !== null &&
			organizationInvitation.recipientEmailAddress !== actorUser.email
		)
	) {
		return (
			<div className="flex flex-col justify-center items-center h-screen w-full py-12">
				<h1 className="text-3xl font-medium mb-12">
					This invitation was sent to{' '}
					<span className="font-bold">
						{organizationInvitation.recipientEmailAddress ??
							organizationInvitation.recipientUser?.email}
					</span>, but you're logged in with a different email address.
				</h1>
				<Button
					onClick={async () => {
						signOut();
					}}
				>
					Sign in with a different account
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col justify-center items-center h-screen w-full py-12">
			<div className="absolute top-0 right-0 p-8 text-sm">
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
								<p className="text-sm font-medium">{actorUser.email}</p>
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" container={documentBody}>
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

			<h1 className="text-3xl font-medium mb-12">
				You've been invited to {organizationInvitation.organization.name}
			</h1>

			<div className="flex flex-col justify-start items-center max-w-lg w-full">
				<Card isPadded={false}>
					<div className="border-b border-b-solid border-input flex flex-col w-full">
						<div
							key={organizationInvitation._id}
							className="w-full p-4 flex flex-row justify-between items-center "
						>
							<div className="flex flex-row justify-center items-start gap-x-5">
								<Avatar variant={'square'} size={'lg'}>
									{organizationInvitation.organization.profileImageUrl !==
											null && (
										<AvatarImage
											src={organizationInvitation.organization.profileImageUrl}
										/>
									)}
								</Avatar>
								<div className="flex flex-col justify-center items-start">
									<p>{organizationInvitation.organization.name}</p>
									<p className="text-sm font-light text-muted-foreground">
										{organizationInvitation.organization.membersCount}{' '}
										{`${
											organizationInvitation.organization.membersCount ===
													1 ?
												'member' :
												'members'
										}`}
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								isLoading={loadingInvitation === organizationInvitation._id}
								onClick={async () => {
									setLoadingInvitation(organizationInvitation._id);
									const result = await mutateAcceptOrganizationInvitation
										.mutateAsync(
											{
												actor: { type: 'User', data: { id: actorUser._id } },
												recipientUser: {
													id: actorUser._id,
												},
												organizationInvitation: {
													id: organizationInvitation._id,
												},
											},
										);
									if (result.isOk()) {
										window.location.href = ApiUrl
											.getWebappUrl({
												fromWindow: true,
												withScheme: true,
												path: `/${organizationInvitation.organization.slug}`,
											});
									} else {
										setLoadingInvitation(null);
									}
								}}
							>
								Join
							</Button>
						</div>
					</div>

					<div className="p-4 flex flex-row justify-start items-center w-full">
						<Link
							href="/join"
							className={cn(
								buttonVariants({ variant: 'outline', className: 'gap-x-2' }),
							)}
						>
							<Mail size={14} />
							View all invitations
						</Link>
					</div>
				</Card>
			</div>
		</div>
	);
}
