'use client';

import { Card } from '#components/v1/cards/card.tsx';
import { useAuth } from '#utils/auth.client.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type { OrganizationInvitation_$dashboardPageData } from '@-/database/selections';
import {
	Avatar,
	AvatarImage,
	Button,
	buttonVariants,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { ApiUrl } from '@-/url/api';
import { UserAvatar } from '@-/user/components';
import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function JoinClientPage({
	organizationInvitations,
}: {
	organizationInvitations: ServerDoc<
		typeof OrganizationInvitation_$dashboardPageData
	>[];
}) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const mutateAcceptOrganizationInvitation = trpc.organization.acceptInvitation
		.useMutation();
	const [loadingInvitation, setLoadingInvitation] = useState<string | null>(
		null,
	);
	const { signOut } = useAuth();
	const documentBody = useDocumentBody();

	return (
		<div className="flex flex-col relative justify-center items-center h-screen w-full py-12">
			<div className="absolute top-0 left-0 p-8">
				<a href="/home" target="_blank">
					<img
						src="/assets/images/light-full-transparent.svg"
						className="h-6"
					/>
				</a>
			</div>
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
				You have access to these organizations & projects
			</h1>

			<div className="flex flex-col justify-start items-center max-w-lg w-full">
				<Card isPadded={false}>
					{organizationInvitations.length > 0 && (
						<div className="border-b border-b-solid border-input flex flex-col w-full">
							<p className="p-4 pb-0 text-muted-foreground">Organizations</p>
							{organizationInvitations.map((organizationInvitation) => {
								const { organization } = organizationInvitation;
								return (
									<div
										key={organizationInvitation._id}
										className="w-full p-4 flex flex-row justify-between items-center "
									>
										<div className="flex flex-row justify-center items-start gap-x-5">
											<Avatar variant={'square'} size={'lg'}>
												{organization.profileImageUrl !== null && (
													<AvatarImage src={organization.profileImageUrl} />
												)}
											</Avatar>
											<div className="flex flex-col justify-center items-start">
												<p>{organization.name}</p>
												<p className="text-sm font-light text-muted-foreground">
													{organization.membersCount}{' '}
													{`${
														organization.membersCount ===
																1 ?
															'member' :
															'members'
													}`}
												</p>
											</div>
										</div>
										<Button
											variant="outline"
											isLoading={loadingInvitation ===
												organizationInvitation._id}
											onClick={async () => {
												setLoadingInvitation(organizationInvitation._id);
												const result = await mutateAcceptOrganizationInvitation
													.mutateAsync(
														{
															actor: {
																type: 'User',
																data: {
																	id: actorUser._id,
																},
															},
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
															path: `/${organization.slug}`,
														});
												} else {
													setLoadingInvitation(null);
												}
											}}
										>
											Join
										</Button>
									</div>
								);
							})}
						</div>
					)}
					<div className="p-4 flex flex-row justify-start items-center w-full">
						<Link
							href="/welcome"
							className={buttonVariants({
								variant: 'outline',
								className: 'gap-x-2',
							})}
						>
							<Plus size={14} />
							Create new organization
						</Link>
					</div>
				</Card>
			</div>
		</div>
	);
}
