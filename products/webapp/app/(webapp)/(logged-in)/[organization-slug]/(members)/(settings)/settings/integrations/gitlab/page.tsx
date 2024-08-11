'use client';

import { PersonalAccountCard } from '#components/v1/cards/personal-account-card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { getGitlabAuthUrl } from '@-/integrations';
import { ChevronDown, LogOut } from 'lucide-react';

export default function Page() {
	return <ConnectPersonalGitlabAccountCard />;
}

function ConnectPersonalGitlabAccountCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { actorOrganizationMember, organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const documentBody = useDocumentBody();

	const deleteOrganizationMemberIntegration = trpc.organizationMemberIntegration
		.delete.useMutation();

	return (
		<PersonalAccountCard
			title={actorOrganizationMember.linkedGitlabAccount ?
				'Personal account connected' :
				'Connect personal account'}
			subtitle={actorOrganizationMember.linkedGitlabAccount ?
				'You have connected your GitLab account to Tunnel' :
				'Connect your GitLab account to use this integration'}
			button={actorOrganizationMember.linkedGitlabAccount ?
				(
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full text-muted-foreground justify-end flex focus-visible:ring-0"
								variant="none"
								size="minimal"
							>
								<p className="text-sm font-medium flex items-center">
									{actorOrganizationMember.linkedGitlabAccount.gitlabEmail}
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
										type: 'OrganizationMemberGitlabAccount',
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
							href={getGitlabAuthUrl({
								organizationMemberId: actorOrganizationMember._id,
								organizationId: organization._id,
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
