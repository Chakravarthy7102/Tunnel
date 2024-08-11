'use client';

import { MuratCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/murat-card.tsx';
import { DashboardCard } from '#components/v1/cards/card.tsx';
import { PersonalAccountCard } from '#components/v1/cards/personal-account-card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type { OrganizationMember_$actorProfileData } from '@-/database/selections';
import {
	Button,
	buttonVariants,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	MuratInput,
} from '@-/design-system/v1';
import { getJiraAuthUrl } from '@-/integrations';
import {
	JiraIcon,
	TunnelIcon,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	ArrowLeft,
	ArrowLeftRight,
	ChevronDown,
	LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function JiraClient() {
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	if (
		organization.jiraOrganization && organization.jiraOrganization.webTriggerUrl
	) {
		return (
			<>
				<ConnectPersonalJiraAccountCard
					actorOrganizationMember={actorOrganizationMember}
				/>
				{actorOrganizationMember.role !== 'guest' &&
					actorOrganizationMember.role !== 'member' && (
					<>
						<RemoveJiraCard />
					</>
				)}
			</>
		);
	} else {
		return <JiraOnboarding />;
	}
}

function OnboardingStep(
	{ step, title, children }: {
		step: string;
		title: string;
		children: React.ReactNode;
		isCompleted: boolean;
	},
) {
	return (
		<div className="flex flex-col justify-start items-start gap-y-1.5 w-full last:mb-0 p-4 border-b-[0.5px] border-solid border-b-[#ffffff10] last:border-b-transparent">
			<div className="flex gap-x-1.5 w-full">
				<div className="rounded-full bg-neutral-800 text-xs h-6 w-6 flex justify-center items-center border-[0.5px] border-solid border-[#ffffff10]">
					{step}
				</div>
				<p className="text-neutral-0 text-base font-light">
					{title}
				</p>
			</div>
			<div className="w-full">
				{children}
			</div>
		</div>
	);
}

function JiraOnboarding() {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const [siteURL, setSiteURL] = useState(
		organization.jiraOrganization?.url?.slice(8) ?? '',
	);

	const mutateUpdateOrganization = trpc.organization.update.useMutation();

	const jiraAppUrl =
		'https://developer.atlassian.com/console/install/7402df27-a9dd-4c7b-a903-2e8fa9aee8df?signature=AYABeGl5QHR4DSC4D4soyPSBBS4AAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy1lYXN0LTE6NzA5NTg3ODM1MjQzOmtleS83ZjcxNzcxZC02OWM4LTRlOWItYWU5Ny05MzJkMmNhZjM0NDIAuAECAQB4KZa3ByJMxgsvFlMeMgRb2S0t8rnCLHGz2RGbmY8aB5YBiLdCA0Xj5Gj25hUrm2IBKgAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDC7CssyZ5GQGASbvKAIBEIA7wKiBA8C7kK3XZllODr3G3CqPPqsxY0K%2FijRn3r3LgEtLorn3Azm6Y5BT1knxA%2FG%2BgH90ySUfD4QWfUcAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzU1OWQ0NTE2LWE3OTEtNDdkZi1iYmVkLTAyNjFlODY4ZWE1YwC4AQICAHhHSGfAZiYvvl%2F9LQQFkXnRjF1ris3bi0pNob1s2MiregF%2Fvjr7oWCK%2BwYaNE6Z7zvNAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM%2BY8XGwqXwHjXYX%2BSAgEQgDtMV08OtnZskf7uQPDfccibNgC%2FOBqx4ShJgODfVl7LhlxrA%2FN406x9Q%2FrxeCoQYYI6UHxj7PgLKNrfKwAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtd2VzdC0yOjcwOTU4NzgzNTI0MzprZXkvM2M0YjQzMzctYTQzOS00ZmNhLWEwZDItNDcyYzE2ZWRhZmRjALgBAgIAePadDOCfSw%2BMRVmOIDQhHhGooaxQ%2FiwGaLB334n1X9RCAULpckLwqDkEnja5wec6YlEAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzzNkhLptdSzdkwbDECARCAOxuQ6u0UVMOTey7092pfjccGwUwsTx1ECkt0bThAbWQEWLuAtmltk%2BSBzmYo4sEKsyUPXE7KzV7ZlN3xAgAAAAAMAAAQAAAAAAAAAAAAAAAAAKOriqo8418C6QyrG51CHgT%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADI11Y8E%2FrwB%2BMavVod9mDHzvVXn04pQN40T%2F7KnLfcRpsQIxvYpcE%2F0vWTZokwMyaI1xKwhzXIOI6%2FgSZBdkGbJsRU%3D&product=jira';
	const jiraAppId = '7402df27-a9dd-4c7b-a903-2e8fa9aee8df';
	const jiraAppEnvId = 'a27e8733-444c-4c01-97ed-a8b266274179';

	const searchParams = new URLSearchParams(window.location.search);
	let redirectTo = searchParams.get('redirectTo');

	redirectTo &&= decodeURIComponent(redirectTo);

	return (
		<div className="relative flex flex-col justify-center items-center h-[calc(100vh)] w-full py-12 min-h-[800px] bg-neutral-900">
			<div className="absolute top-0 left-0 p-8">
				<Link
					href={redirectTo ?? `/${organization.slug}/settings/integrations`}
					className={buttonVariants({
						variant: 'muratsecondary',
						size: 'muratsm',
					})}
				>
					<ArrowLeft size={14} className="text-neutral-400" />
					Back
				</Link>
			</div>
			<div className="flex flex-col justify-center items-center md:p-6 rounded-md w-full max-w-md h-full">
				<div className="flex flex-row justify-center items-center gap-x-2 mb-4">
					<TunnelIcon
						variant={'rounded'}
						size={'lg'}
						className="border border-solid border-input"
					/>
					<ArrowLeftRight size={24} className="text-blue-600" />
					<JiraIcon
						variant={'rounded'}
						size={'lg'}
					/>
				</div>

				<h1 className="text-xl text-neutral-0 font-medium mb-1 text-center">
					Connect Tunnel to Jira
				</h1>
				<p className="text-neutral-300 w-full px-4 text-center mb-8">
					Follow the steps below to setup your Jira integration
				</p>

				<MuratCard className="gap-y-2 flex flex-col w-full">
					<OnboardingStep
						step="1"
						title="Enter your Jira site URL"
						isCompleted={false}
					>
						<div className="flex gap-x-1">
							<MuratInput
								placeholder="your-company.atlassian.net"
								value={siteURL}
								onChange={(e) => setSiteURL(e.target.value)}
							/>
							<Button
								variant="muratblue"
								className="h-full w-[64px]"
								isLoading={isLoading}
								disabled={organization.jiraOrganization?.url?.endsWith(
									siteURL,
								) ??
									siteURL === ''}
								onClick={async () => {
									setIsLoading(true);

									const result = await mutateUpdateOrganization.mutateAsync({
										actor: {
											type: 'User',
											data: { id: actorUser._id },
										},
										organization: {
											id: organization._id,
										},
										updates: {
											jiraOrganization: {
												webTriggerUrl: null,
												url: `https://${siteURL}`,
												default: null,
												createAutomatically: false,
											},
										},
									});

									if (result.isErr()) {
										toast.procedureError(result);
										return;
									}

									setIsLoading(false);
								}}
							>
								Save
							</Button>
						</div>
					</OnboardingStep>

					<OnboardingStep
						step="2"
						title="Install the Jira app"
						isCompleted={false}
					>
						{organization.jiraOrganization?.url ?
							(
								<Link
									href={jiraAppUrl}
									target="_blank"
									className={cn(
										buttonVariants({
											variant: 'muratblue',
										}),
										'w-full',
									)}
								>
									Install App
								</Link>
							) :
							(
								<Button variant="muratblue" className="w-full" disabled={true}>
									Install App
								</Button>
							)}
					</OnboardingStep>

					<OnboardingStep
						step="3"
						title="Configure the Jira app"
						isCompleted={false}
					>
						{organization.jiraOrganization?.url ?
							(
								<Link
									href={`https://${siteURL}/jira/settings/apps/${jiraAppId}/${jiraAppEnvId}`}
									target="_blank"
									className={cn(
										buttonVariants({
											variant: 'muratsecondary',
										}),
										'w-full',
									)}
								>
									Configure App
								</Link>
							) :
							(
								<Button
									variant="muratsecondary"
									className="w-full"
									disabled={true}
								>
									Configure App
								</Button>
							)}
					</OnboardingStep>
				</MuratCard>
			</div>
		</div>
	);
}

function ConnectPersonalJiraAccountCard(
	{ actorOrganizationMember }: {
		actorOrganizationMember: ServerDoc<
			typeof OrganizationMember_$actorProfileData
		>;
	},
) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');

	const documentBody = useDocumentBody();

	const deleteOrganizationMemberIntegration = trpc.organizationMemberIntegration
		.delete.useMutation();

	return (
		<PersonalAccountCard
			title={actorOrganizationMember.linkedJiraAccount ?
				'Personal account connected' :
				'Connect personal account'}
			subtitle={actorOrganizationMember.linkedJiraAccount ?
				'You have connected your Jira account to Tunnel' :
				'Connect your Jira account to use this integration'}
			button={actorOrganizationMember.linkedJiraAccount ?
				(
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full text-muted-foreground justify-end flex focus-visible:ring-0"
								variant="none"
								size="minimal"
							>
								<p className="text-sm font-medium flex items-center">
									{actorOrganizationMember.linkedJiraAccount.jiraEmailAddress}
									<ChevronDown className="ml-2" size={16} />
								</p>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" container={documentBody}>
							<DropdownMenuItem
								onClick={async () => {
									(await deleteOrganizationMemberIntegration.mutateAsync({
										actor: {
											type: 'User',
											data: { id: actorUser._id },
										},
										organizationMember: {
											id: actorOrganizationMember._id,
										},
										type: 'OrganizationMemberJiraAccount',
									})).unwrapOrThrow();
								}}
								danger
							>
								<LogOut size={14} />
								Disconnect
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) :
				(
					<Button asChild variant="outline">
						<a
							href={getJiraAuthUrl({
								organizationMemberId: actorOrganizationMember._id,
								redirectPath: null,
							})}
							className="flex items-center"
						>
							Connect
						</a>
					</Button>
				)}
		/>
	);
}

function RemoveJiraCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, setOrganization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const mutateUpdateOrganization = trpc.organization.update.useMutation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	return (
		<DashboardCard
			title="Remove Jira connection"
			subtitle="Are you sure you want to remove your Jira connection?"
			isDanger
			button={
				<Button
					isLoading={isLoading}
					variant="destructive"
					onClick={async () => {
						setIsLoading(true);
						const result = await mutateUpdateOrganization.mutateAsync(
							{
								actor: {
									type: 'User',
									data: { id: actorUser._id },
								},
								organization: {
									id: organization._id,
								},
								updates: {
									jiraOrganization: null,
								},
							},
						);
						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						setOrganization({
							...organization,
							jiraOrganization: null,
						});
						router.push(`/${organization.slug}/settings/integrations`);
					}}
				>
					Remove
				</Button>
			}
		>
		</DashboardCard>
	);
}
