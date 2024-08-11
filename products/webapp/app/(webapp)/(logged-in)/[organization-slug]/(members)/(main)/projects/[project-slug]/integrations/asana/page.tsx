'use client';

import { DashboardCard, SubCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import { Button, Switch } from '@-/design-system/v1';

import {
	useAsanaContext,
} from '@-/integrations';
import {
	AsanaAssigneeCombobox,
	AsanaIcon,
	AsanaProjectCombobox,
	AsanaSectionCombobox,
	AsanaTagsCombobox,
	ComboboxRow,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	GaugeCircle,
	Grid2x2,
	Tags,
	UserCircle,
	Workflow,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	return <AsanaSettingsCard />;
}

function AsanaSettingsCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const actorUserDoc = createDoc('User', actorUser);

	const { actorOrganizationMember, organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const actorOrganizationMemberDoc = createDoc(
		'OrganizationMember',
		actorOrganizationMember,
	);
	const organizationDoc = createDoc('Organization', organization);

	const { project: tunnelProject } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	const documentBody = useDocumentBody();

	const asanaContext = useAsanaContext(
		{
			actorUser: actorUserDoc,
			organization: organizationDoc,
			actorOrganizationMember: actorOrganizationMemberDoc,
			container: documentBody,
			trpc,
		},
		tunnelProject.asanaSettings?.default ?? null,
		tunnelProject.asanaSettings?.createAutomatically ??
			false,
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const updateProjectMutation = trpc.project.update.useMutation();

	if (asanaContext === null) {
		return null;
	}

	const {
		project,
		section,
		assignee,
		tags,
		name,
		createAutomatically,
		setCreateAutomatically,
		clear,
	} = asanaContext;

	const saveAsanaDefault = async ({ isClear }: { isClear: boolean }) => {
		if (!organization.asanaOrganization) return;
		setIsLoading(true);
		const result = await updateProjectMutation.mutateAsync(
			{
				actor: { type: 'User', data: { id: actorUser._id } },
				project: {
					id: tunnelProject._id,
				},
				updates: {
					asanaSettings: {
						default: {
							name: isClear ? null : name,
							assignee: isClear ? null : assignee,
							project: isClear ? null : project,
							section: isClear ? null : section,
							tags: isClear ? [] : tags,
							parentTask: null,
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

		toast.ASANA_DEFAULT_PROJECT_UPDATE_SUCCESS();
	};

	return (
		<DashboardCard
			title="Asana integration"
			icon={<AsanaIcon />}
			isPadded={false}
			subtitle="Change your project's settings for the Asana integration"
			button={
				<div className="gap-x-2 flex flex-row justify-center items-center">
					<Button
						onClick={async () => {
							clear();
							await saveAsanaDefault({ isClear: true });
						}}
						variant="ghost"
					>
						Clear
					</Button>
					<Button
						isLoading={isLoading}
						onClick={async () => {
							await saveAsanaDefault({ isClear: false });
						}}
					>
						Save
					</Button>
				</div>
			}
		>
			<div className="flex flex-col justify-start items-start w-full gap-2 last:border-none last:border-b-transparent">
				<ComboboxRow
					isPadded={true}
					title="Project"
					icon={<Grid2x2 size={14} className="text-muted-foreground" />}
					combobox={<AsanaProjectCombobox asanaContext={asanaContext} />}
					isRequired={true}
				/>

				{project && (
					<ComboboxRow
						isPadded={true}
						title="Section"
						icon={<GaugeCircle size={14} className="text-muted-foreground" />}
						combobox={<AsanaSectionCombobox asanaContext={asanaContext} />}
					/>
				)}

				<ComboboxRow
					isPadded={true}
					title="Assignee"
					icon={<UserCircle size={14} className="text-muted-foreground" />}
					combobox={<AsanaAssigneeCombobox asanaContext={asanaContext} />}
				/>

				<ComboboxRow
					isPadded={true}
					title="Tags"
					icon={<Tags size={14} className="text-muted-foreground" />}
					combobox={<AsanaTagsCombobox asanaContext={asanaContext} />}
				/>

				<SubCard>
					<ComboboxRow
						isPadded={true}
						title="Automatically create"
						description="Automatically create Asana tickets with every tunnel thread"
						icon={<Workflow size={14} className="text-muted-foreground" />}
						combobox={
							<Switch
								checked={createAutomatically}
								className="data-[state=unchecked]:bg-[#404040]"
								disabled={!project}
								onCheckedChange={(checked) => {
									if (project) {
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
