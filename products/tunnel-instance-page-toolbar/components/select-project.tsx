import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import { createDoc } from '@-/client-doc';
import { useConvex } from '@-/convex/react';
import {
	clientId,
	type DocBase,
	type ServerDoc,
} from '@-/database';
import { useVapi } from '@-/database/react';
import type {
	OrganizationMember_$organizationData,
	Project_$organizationData,
	Project_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@-/design-system/v1';
import { HostEnvironmentType } from '@-/host-environment';
import { OrganizationAvatar } from '@-/organization/components';
import { toast } from '@-/tunnel-error';
import destr from 'destru';
import groupBy from 'just-group-by';
import { Plus } from 'lucide-react';
import path from 'pathe';
import { useEffect, useState } from 'react';

type ProjectToSelect = ServerDoc<typeof Project_$organizationData>;
type OrgMember = ServerDoc<typeof OrganizationMember_$organizationData>;

/**
	When the user selects a project, we automatically create a tunnel instance and project live preview for them.
*/
export function SelectProject({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: false;
		hostnameType: 'local';
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
		isOnline: true;
	}>;
}) {
	const { webappTrpc } = getWebappTrpc({ context });
	const { localProxyTrpc } = getLocalProxyTrpc({ context });
	const state = useContextStore(context);
	const vapi = useVapi();
	const convex = useConvex();

	const [organizationId, setOrganizationId] = useState<string | null>(null);
	const [organizations, setOrganizations] = useState<
		DocBase<'Organization'>[] | null
	>(null);
	const [isCreatingNewProject, setIsCreatingNewProject] = useState(false);
	const [projects, setProjects] = useState<ProjectToSelect[] | null>(null);
	const [organizationMembers, setOrganizationMembers] = useState<
		OrgMember[] | null
	>(null);
	const projectsByOrganization = projects === null ? null : groupBy(
		projects,
		(project) => project.organization._id,
	);

	const onProjectSelect = async (project: ProjectToSelect) => {
		const localProjectEnvironment =
			context.hostEnvironment.type === HostEnvironmentType.wrapperCommand &&
			context.hostEnvironment.localProjectEnvironment;

		if (!localProjectEnvironment) {
			return;
		}

		let userLocalWorkspace = await (async () => {
			try {
				return await convex.query(
					vapi.v.UserLocalWorkspace_get,
					{
						input: {
							from: {
								user: state.actor.data.id,
								project: project._id,
								relativeDirpath: path.relative(
									localProjectEnvironment.rootDirpath,
									localProjectEnvironment.workingDirpath,
								),
							},
						},
					},
				);
			} catch {
				return null;
			}
		})();

		if (userLocalWorkspace === null) {
			userLocalWorkspace = await convex.mutation(
				vapi.v.UserLocalWorkspace_insert,
				{
					input: {
						user: state.actor.data.id,
						project: project._id,
						linkedTunnelInstanceProxyPreview: null,
						relativeDirpath: path.relative(
							localProjectEnvironment.rootDirpath,
							localProjectEnvironment.workingDirpath,
						),
					},
				},
			);
		}

		(await localProxyTrpc.userLocalWorkspace.save.mutate({
			userLocalWorkspaceId: userLocalWorkspace._id,
			projectId: project._id,
			userId: state.actor.data.id,
			relativeDirpath: path.relative(
				localProjectEnvironment.rootDirpath,
				localProjectEnvironment.workingDirpath,
			),
			linkedTunnelInstanceProxyPreviewId: null,
		})).unwrapOrThrow();

		const createProjectAction = createDoc.action(
			'Project',
			(create) =>
				create<typeof Project_$tunnelInstancePageToolbarData>(project),
		);

		context.store.setState((state) => {
			state = createProjectAction(state);
			return {
				...state,
				projectId: createProjectAction._id as unknown as null,
			};
		});
	};

	useEffect(() => {
		void (async () => {
			const projects = await webappTrpc.project.list$organizationData.query({
				actor: state.actor,
				user: {
					id: state.actor.data.id,
				},
			});
			const organizationMembers = await webappTrpc.organizationMember
				.list$organizationData
				.query({
					actor: state.actor,
					user: {
						id: state.actor.data.id,
					},
					includeProjectGuests: true,
				});

			if (projects.isErr()) {
				toast.procedureError(projects);
			} else {
				setProjects(projects.value);
			}

			if (organizationMembers.isErr()) {
				toast.procedureError(organizationMembers);
			} else {
				setOrganizationMembers(organizationMembers.value);
			}
		})();
	}, []);

	const shadowRootElement = useShadowRootElement();

	return (
		<>
			<Dialog
				open={isCreatingNewProject}
				onOpenChange={setIsCreatingNewProject}
			>
				<DialogContent container={shadowRootElement}>
					<DialogHeader>
						<DialogTitle>Create a new project</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<Select
							disabled={organizations === null}
							onValueChange={async (organizationId) => {
								setOrganizationId(organizationId);
							}}
						>
							<SelectTrigger className="w-full text-white ">
								<SelectValue placeholder={'Select a organization...'} />
							</SelectTrigger>
							<SelectContent
								className="w-full text-white z-[10000]"
								container={shadowRootElement}
							>
								{organizations !== null &&
									organizations.map((organization) => (
										<SelectItem
											className="cursor-pointer"
											key={clientId(organization._id)}
											value={organization._id}
										>
											<div className="flex flex-row justify-between items-center w-full">
												<p>{organization.name}</p>
											</div>
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</DialogBody>
					<DialogFooter>
						<Button
							variant="blue"
							onClick={async () => {
								if (organizationId === null) {
									return;
								}

								const organization = organizations?.find(
									(organization) => organization._id === organizationId,
								);

								if (organization === undefined) {
									return;
								}

								const { webappTrpc } = getWebappTrpc({ context });

								const organizationMember = organizationMembers?.find((
									organizationMember,
								) => organizationMember.organization._id === organization._id);

								if (!organizationMember) {
									return;
								}

								const project = await webappTrpc.project
									.create$organizationAndMembersData.mutate({
										actor: state.actor,
										// TODO: allow the user to customize it
										name: document.title,
										ownerOrganization: {
											id: organization._id,
										},
										githubRepository: null,
										gitlabProject: null,
										organizationMember: {
											id: organizationMember._id,
										},
									});

								setIsCreatingNewProject(false);

								if (project.isErr()) {
									toast.procedureError(project);
								} else {
									await onProjectSelect(project.value);
								}
							}}
						>
							Create
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Select
				disabled={projects === null}
				onValueChange={async (stringifiedValue) => {
					const value = destr(stringifiedValue) as any;
					if (value.type === 'project') {
						const { projectName } = value;
						const project = projects?.find(
							(project) => project.name === projectName,
						);
						if (project === undefined) return;
						await onProjectSelect(project);
					} else {
						const { actionName } = value;
						if (actionName === 'createNewProject') {
							// HEAD
							//
							const organizationMembers =
								(await webappTrpc.organizationMember.list$organizationData
									.query({
										actor: state.actor,
										user: {
											id: state.actor.data.id,
										},
										includeProjectGuests: true,
									})).unwrapOrThrow();

							// origin/main
							const organizations = organizationMembers.map(
								(organizationMember) => organizationMember.organization,
							);

							setOrganizations(organizations);
							if (organizations[0] !== undefined) {
								setOrganizationId(organizations[0]._id);
							}

							setIsCreatingNewProject(true);
						}
					}
				}}
			>
				<SelectTrigger className="w-full text-white rounded-[8px]">
					<SelectValue placeholder={'Select a project...'} />
				</SelectTrigger>
				<SelectContent
					className="w-full text-white"
					container={shadowRootElement}
				>
					{projectsByOrganization !== null &&
						Object.entries(projectsByOrganization).map((
							[organizationId, projects],
						) => {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
							const { organization } = projects[0]!;

							return (
								<SelectGroup key={organizationId}>
									<SelectLabel>
										<div className="flex items-center gap-2 underline">
											<OrganizationAvatar
												size="sm"
												profileImageUrl={organization.profileImageUrl}
												name={organization.name}
											/>
											{organization.name}
										</div>
									</SelectLabel>
									{projects.map((project) => (
										<SelectItem
											className="cursor-pointer"
											key={clientId(project._id)}
											value={JSON.stringify({
												type: 'project',
												projectName: project.name,
											})}
										>
											<div className="flex flex-row justify-between items-center w-full">
												<p>{project.name}</p>
											</div>
										</SelectItem>
									))}
								</SelectGroup>
							);
						})}
					<SelectItem
						className="cursor-pointer"
						value={JSON.stringify({
							type: 'action',
							actionName: 'createNewProject',
						})}
					>
						<div className="flex flex-row justify-between items-center w-full gap-2">
							<Plus size={10} />
							<p>Create New Project</p>
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</>
	);
}
