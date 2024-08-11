import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import {
	Button,
	Input,
} from '@-/design-system/v1';
import { OrganizationAvatar } from '@-/organization/components';
import { toast } from '@-/tunnel-error';
import { ApiUrl } from '@-/url/api';
import slugify from '@sindresorhus/slugify';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function OrganizationSettingsCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { updateOrganizationProfileImageUrl, organization, setOrganization } =
		useRouteContext(
			'(webapp)/(logged-in)/[organization-slug]/(members)',
		);

	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState<string>(organization.name);
	const [slug, setSlug] = useState<string>(organization.slug);

	const updateOrganization = trpc.organization.update.useMutation();

	return (
		<DashboardCard
			title="Organization profile"
			subtitle="Edit your organization profile and settings"
			button={
				<Button
					onClick={async () => {
						setIsLoading(true);
						const result = await updateOrganization.mutateAsync(
							{
								organization: {
									id: organization._id,
								},
								actor: { type: 'User', data: { id: actorUser._id } },
								updates: {
									name,
									slug,
								},
							},
						);
						setIsLoading(false);
						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						setOrganization({ ...organization, name, slug });
						toast.ORGANIZATION_UPDATE_SUCCESS();
						router.push(`/${slug}/settings`);
					}}
					isLoading={isLoading}
				>
					Save
				</Button>
			}
		>
			<div className="flex flex-col justify-center items-start w-full gap-3">
				<div className="flex flex-col justify-start items-start w-full">
					<label className="text-sm text-muted-foreground mb-1">Logo</label>

					<div className="group relative h-24 w-24 rounded-[5px] transition-all">
						<div className="relative h-auto w-auto group">
							<input
								type="file"
								className="opacity-0 absolute inset-0 h-full w-full z-[50] text-[0px] !cursor-pointer"
								onChange={async (e) => {
									if (e.target.files?.[0]) {
										await updateOrganizationProfileImageUrl(e.target.files[0]);
									}
								}}
								accept="image/*"
							/>
							<div className="bg-background/30 group-hover:flex hidden p-3 text-sm font-medium transition-all absolute inset-0 h-full w-full text-foreground z-[49] justify-center text-center items-center rounded-[5px]">
								<Pencil />
							</div>
							<OrganizationAvatar
								size="2xl"
								variant="square"
								className="border border-border border-solid"
								profileImageUrl={organization.profileImageUrl}
								name={organization.name}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col justify-start items-start w-full">
					<label className="w-full">
						<div className="text-sm text-muted-foreground mb-1">Name</div>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</label>
				</div>

				<div className="flex flex-col justify-start items-start w-full">
					<label
						htmlFor="slug-input"
						className="text-sm text-muted-foreground mb-1"
					>
						Slug
					</label>
					<div className="flex flex-row justify-start items-stretch w-full h-full">
						<div className="rounded-l-md rounded-r-none bg-secondary border-input border-solid border px-2 flex justify-center items-center">
							<p className="text-sm text-muted-foreground">
								{ApiUrl.getWebappUrl({
									withScheme: false,
									path: '/',
									fromWindow: true,
								})}
							</p>
						</div>
						<Input
							id="slug-input"
							value={slug}
							onChange={(e) => setSlug(slugify(e.target.value))}
							className="rounded-l-none"
						/>
					</div>
				</div>
			</div>
		</DashboardCard>
	);
}
