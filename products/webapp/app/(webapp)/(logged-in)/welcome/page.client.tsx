'use client';

import { Card } from '#components/v1/cards/card.tsx';
import { useAuth } from '#utils/auth.client.ts';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@-/design-system/v1';
import {
	ORGANIZATION_METADATA_ROLE_OPTIONS as roleOptions,
	ORGANIZATION_METADATA_SIZE_OPTIONS as sizeOptions,
} from '@-/organization/constants';
import { toast } from '@-/tunnel-error';
import { ApiUrl } from '@-/url/api';
import { UserAvatar } from '@-/user/components';
import slugify from '@sindresorhus/slugify';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WelcomeClient() {
	const [organizationName, setOrganizationName] = useState('');
	const [organizationSlug, setOrganizationSlug] = useState('');
	const [ownerRole, setOwnerRole] = useState<
		(typeof roleOptions)[number] | null
	>(null);
	const [organizationSize, setOrganizationSize] = useState<
		(typeof sizeOptions)[number] | null
	>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const createOrganization = trpc.organization.create.useMutation();

	const { signOut } = useAuth();

	const { actorUser } = useRouteContext('(webapp)/(logged-in)');

	useEffect(() => {
		setOrganizationSlug(slugify(organizationName));
	}, [organizationName]);

	const documentBody = useDocumentBody();

	return (
		<div className="relative flex flex-col justify-center items-center h-screen w-full py-12">
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

			<h1 className="text-3xl font-medium mb-6">Create a new organization</h1>
			<p className="mb-8 text-lg text-muted-foreground max-w-md text-center">
				An organization is a workspace where you can invite your team and
				collaborate on previews and feedback
			</p>

			<div className="flex flex-col justify-start items-center max-w-lg w-full">
				<Card>
					<div className="flex flex-col justify-center items-center gap-y-3 w-full">
						<div className="flex flex-col justify-start items-start w-full">
							<label className="w-full">
								<div className="mb-1 text-sm text-foreground/80">Name</div>
								<Input
									value={organizationName}
									onChange={(e) => setOrganizationName(e.target.value)}
								/>
							</label>
						</div>
						<div className="flex flex-col justify-start items-start w-full">
							<label
								htmlFor="slug-input"
								className="text-sm mb-1 text-foreground/80 self-stretch"
							>
								Slug
							</label>
							<div className="flex flex-row justify-start items-stretch w-full">
								<div className="rounded-l-md rounded-r-none bg-secondary border-input border-solid border px-2 flex justify-center items-center">
									<p className="text-sm text-muted-foreground">
										{ApiUrl.getWebappUrl({
											fromWindow: true,
											withScheme: false,
											path: '/',
										})}
									</p>
								</div>
								<Input
									id="slug-input"
									value={organizationSlug}
									onChange={(e) => setOrganizationSlug(slugify(e.target.value))}
									className="rounded-l-none"
								/>
							</div>
						</div>
						<div className="w-full h-[1px] bg-input my-2"></div>
						<div className="flex flex-col justify-start items-start w-full">
							<label className="w-full">
								<div className="text-sm mb-1 text-foreground/80">
									How large is your company?
								</div>
								<Select
									value={organizationSize ?? undefined}
									onValueChange={(v) => {
										if (v === 'Select company size') {
											setOrganizationSize(null);
										} else {
											setOrganizationSize(v as (typeof sizeOptions)[number]);
										}
									}}
									defaultValue="Select company size"
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent container={documentBody}>
										<SelectItem value="Select company size">
											Select company size
										</SelectItem>
										{sizeOptions.map((option, i) => (
											<SelectItem key={i} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</label>
						</div>
						<div className="flex flex-col justify-start items-start w-full">
							<label className="w-full">
								<div className="text-sm mb-1 text-foreground/80">
									What is your role?
								</div>
								<Select
									value={ownerRole ?? undefined}
									onValueChange={(v) => {
										if (v === 'Select your role') {
											setOwnerRole(null);
										} else {
											setOwnerRole(v as (typeof roleOptions)[number]);
										}
									}}
									defaultValue="Select your role"
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent container={documentBody}>
										<SelectItem value="Select your role">
											Select your role
										</SelectItem>
										{roleOptions.map((option, i) => (
											<SelectItem key={i} value={option}>
												{option}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</label>
						</div>
					</div>
				</Card>
			</div>

			<Button
				isLoading={isLoading}
				disabled={organizationName.length === 0 ||
					organizationSlug.length === 0 ||
					isLoading}
				onClick={async () => {
					setIsLoading(true);
					const result = await createOrganization.mutateAsync(
						{
							actor: { type: 'User', data: { id: actorUser._id } },
							ownerUser: {
								id: actorUser._id,
							},
							slug: organizationSlug,
							name: organizationName,
							metadata: {
								ownerRole,
								size: organizationSize,
							},
						},
					);
					setIsLoading(false);
					if (result.isErr()) {
						toast.procedureError(result);
						return;
					}

					window.location.href = `/${organizationSlug}/welcome`;
				}}
				className="h-12 mt-6 w-[340px]"
			>
				Create workspace
			</Button>
		</div>
	);
}
