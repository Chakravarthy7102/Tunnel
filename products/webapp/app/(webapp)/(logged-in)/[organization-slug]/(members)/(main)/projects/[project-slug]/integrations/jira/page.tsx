'use client';

import { DashboardCard, SubCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import {
	Button,
	Switch,
} from '@-/design-system/v1';
import { useJiraContext } from '@-/integrations';
import {
	ComboboxRow,
	JiraIcon,
	JiraLabelsCombobox,
	JiraProjectCombobox,
	JiraProjectIssueTypeCombobox,
	JiraUsersCombobox,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	BadgeAlert,
	FolderKanban,
	Tags,
	UserCircle,
	Workflow,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	return <JiraSettingsCard />;
}

function JiraSettingsCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project: tunnelProject } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);
	const documentBody = useDocumentBody();

	const actorUserDoc = createDoc('User', actorUser);
	const actorOrganizationMemberDoc = createDoc(
		'OrganizationMember',
		actorOrganizationMember,
	);
	const organizationDoc = createDoc('Organization', organization);

	if (!organization.jiraOrganization) {
		return null;
	}

	const jiraContext = useJiraContext(
		{
			actorUser: actorUserDoc,
			actorOrganization: organizationDoc,
			actorOrganizationMember: actorOrganizationMemberDoc,
			container: documentBody,
			trpc,
		},
		tunnelProject.jiraSettings?.default ?? null,
		tunnelProject.jiraSettings?.createAutomatically ??
			false,
	);

	if (jiraContext === null) {
		return null;
	}

	const updateProjectMutation = trpc.project.update.useMutation();

	const {
		project,
		assignee,
		issueType,
		labels,
		title,
		parentIssue,
		createAutomatically,
		setCreateAutomatically,
		clear,
	} = jiraContext;

	const saveJiraDefault = async ({ isClear }: { isClear: boolean }) => {
		if (!organization.jiraOrganization) return;
		setIsLoading(true);
		const result = await updateProjectMutation.mutateAsync(
			{
				actor: { type: 'User', data: { id: actorUser._id } },
				project: {
					id: tunnelProject._id,
				},
				updates: {
					jiraSettings: {
						default: {
							title: isClear ? null : title,
							assignee: isClear ? null : assignee,
							issueType: isClear ? null : issueType,
							project: isClear ? null : project,
							labels: isClear ? [] : labels,
						},
						createAutomatically: isClear ? false : createAutomatically,
					},
				},
			},
		);
		setIsLoading(false);
		if (result.isErr()) {
			toast.procedureError(result);
			return;
		}

		toast.JIRA_DEFAULT_PROJECT_UPDATE_SUCCESS();
	};

	return (
		<DashboardCard
			title="Jira integration"
			icon={<JiraIcon />}
			isPadded={false}
			subtitle="Change your project's settings for the Jira integration"
			button={
				<div className="gap-x-2 flex flex-row justify-center items-center">
					<Button
						onClick={async () => {
							clear();
							await saveJiraDefault({ isClear: true });
						}}
						variant="ghost"
					>
						Clear
					</Button>
					<Button
						isLoading={isLoading}
						onClick={async () => {
							await saveJiraDefault({ isClear: false });
						}}
					>
						Save
					</Button>
				</div>
			}
		>
			<div className="flex flex-col justify-start items-start w-full gap-2 last:border-none last:border-b-transparent">
				<ComboboxRow
					title="Project"
					icon={<FolderKanban size={14} className="text-muted-foreground" />}
					combobox={
						<JiraProjectCombobox
							jiraContext={jiraContext}
						/>
					}
					isPadded={true}
				/>
				{project !== null && (
					<>
						<ComboboxRow
							isPadded={true}
							title="Issue type"
							icon={<BadgeAlert size={14} className="text-muted-foreground" />}
							combobox={
								<JiraProjectIssueTypeCombobox
									jiraContext={jiraContext}
									projectId={project.id}
								/>
							}
						/>
						<ComboboxRow
							isPadded={true}
							title="Labels"
							icon={<Tags size={14} className="text-muted-foreground" />}
							combobox={
								<JiraLabelsCombobox
									jiraContext={jiraContext}
								/>
							}
						/>
					</>
				)}
				<ComboboxRow
					isPadded={true}
					title="Assignee"
					icon={<UserCircle size={14} className="text-muted-foreground" />}
					combobox={
						<JiraUsersCombobox
							jiraContext={jiraContext}
						/>
					}
				/>
				<SubCard>
					<ComboboxRow
						isPadded={true}
						title="Automatically create"
						description="Automatically create Jira tickets with every tunnel thread"
						icon={<Workflow size={14} className="text-muted-foreground" />}
						combobox={
							<Switch
								checked={createAutomatically}
								className="data-[state=unchecked]:bg-[#404040]"
								disabled={!project || !issueType ||
									(issueType.subtask && !parentIssue)}
								onCheckedChange={(checked) => {
									if (
										!(
											!project ||
											!issueType ||
											(issueType.subtask && !parentIssue)
										)
									) {
										setCreateAutomatically(checked);
									}
								}}
							/>
						}
					>
					</ComboboxRow>
				</SubCard>
			</div>
		</DashboardCard>
	);
}
