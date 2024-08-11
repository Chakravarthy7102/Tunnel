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
import {
	useLinearContext,
} from '@-/integrations';
import {
	ComboboxRow,
	LinearAssigneeCombobox,
	LinearIcon,
	LinearLabelsCombobox,
	LinearPriorityCombobox,
	LinearProjectCombobox,
	LinearStatusCombobox,
	LinearTeamCombobox,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	BarChart,
	GaugeCircle,
	Grid2x2,
	Tags,
	UserCircle,
	UserSquare,
	Workflow,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	return <LinearSettingsCard />;
}

function LinearSettingsCard() {
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, actorOrganizationMember } = useRouteContext(
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

	const linearContext = useLinearContext(
		{
			actorUser: actorUserDoc,
			actorOrganizationMember: actorOrganizationMemberDoc,
			container: documentBody,
			trpc,
			organization: organizationDoc,
		},
		tunnelProject.linearSettings?.default ?? null,
		tunnelProject.linearSettings?.createAutomatically ??
			false,
	);

	if (!organization.linearOrganization) {
		return null;
	}

	if (linearContext === null) {
		return null;
	}

	const {
		team,
		assignee,
		labels,
		priority,
		project,
		status,
		createAutomatically,
		setCreateAutomatically,
		clear,
	} = linearContext;

	const updateProjectMutation = trpc.project.update.useMutation();

	const saveLinearDefault = async ({ isClear }: { isClear: boolean }) => {
		if (!organization.linearOrganization) return;
		setIsLoading(true);

		const result = await updateProjectMutation.mutateAsync(
			{
				actor: {
					type: 'User',
					data: { id: actorUser._id },
				},
				project: {
					id: tunnelProject._id,
				},
				updates: {
					linearSettings: {
						default: {
							team: isClear ? null : team,
							assignee: isClear ? null : assignee,
							labels: isClear ? [] : labels,
							priority: isClear ? null : priority,
							project: isClear ? null : project,
							status: isClear ? null : status,
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

		toast.LINEAR_DEFAULT_PROJECT_UPDATE_SUCCESS();
	};

	return (
		<DashboardCard
			title="Linear integration"
			isPadded={false}
			subtitle="Change your project's settings for the Linear integration"
			icon={<LinearIcon />}
			button={
				<div className="flex flex-row justify-center items-center gap-x-2">
					<Button
						variant="ghost"
						onClick={async () => {
							clear();
							await saveLinearDefault({ isClear: true });
						}}
					>
						Clear
					</Button>
					<Button
						isLoading={isLoading}
						onClick={async () => {
							await saveLinearDefault({ isClear: false });
						}}
					>
						Save
					</Button>
				</div>
			}
		>
			<div className="flex flex-col justify-start items-start w-full last:border-none last:border-b-transparent">
				<>
					<ComboboxRow
						isPadded={true}
						title="Team"
						icon={<UserSquare size={14} className="text-muted-foreground" />}
						combobox={<LinearTeamCombobox linearContext={linearContext} />}
						isRequired={true}
					/>
					{team && (
						<>
							<ComboboxRow
								isPadded={true}
								title="Project"
								icon={<Grid2x2 size={14} className="text-muted-foreground" />}
								combobox={
									<LinearProjectCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={true}
								title="Status"
								icon={
									<GaugeCircle size={14} className="text-muted-foreground" />
								}
								combobox={
									<LinearStatusCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={true}
								title="Labels"
								icon={<Tags size={14} className="text-muted-foreground" />}
								combobox={
									<LinearLabelsCombobox linearContext={linearContext} />
								}
							/>
							<ComboboxRow
								isPadded={true}
								title="Assignee"
								icon={
									<UserCircle size={14} className="text-muted-foreground" />
								}
								combobox={
									<LinearAssigneeCombobox linearContext={linearContext} />
								}
							/>
						</>
					)}
					<ComboboxRow
						isPadded={true}
						title="Priority"
						icon={<BarChart size={14} className="text-muted-foreground" />}
						combobox={<LinearPriorityCombobox linearContext={linearContext} />}
					/>
				</>

				<SubCard>
					<ComboboxRow
						isPadded={true}
						className="border-[#404040]"
						title="Automatically create"
						description="Automatically create Linear issues with every tunnel thread"
						icon={<Workflow size={14} className="text-muted-foreground" />}
						combobox={
							<Switch
								className="data-[state=unchecked]:bg-[#404040]"
								checked={createAutomatically}
								disabled={!team}
								onCheckedChange={(checked) => {
									if (team) {
										setCreateAutomatically(checked);
									}
								}}
							/>
						}
					/>
				</SubCard>
			</div>
		</DashboardCard>
	);
}
