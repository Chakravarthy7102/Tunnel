import { GithubRepositoryDialog } from '#components/dialogs/github-repository-dialog.tsx';
import { PortDialog } from '#components/dialogs/port-dialog.tsx';
import { SettingsDialog } from '#components/dialogs/settings-dialog.tsx';
import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { logout } from '#utils/authentication.ts';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { useToolbarElement } from '#utils/shadow-root.ts';
import { getPageToolbarSecretStorage } from '#utils/storage.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import { select } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import {
	Project_$organizationData,
	ProjectLivePreview_$createdByUserData,
} from '@-/database/selections';
import {
	cn,
	MuratDropdownMenuItem,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@-/design-system/v1';
import { RELEASE } from '@-/env/app';
import { HostEnvironmentType } from '@-/host-environment';
import { getGithubAuthUrl } from '@-/integrations';
import { ApiUrl } from '@-/url/api';
import {
	ExternalLink,
	EyeOff,
	Github,
	LogOut,
	MoreHorizontal,
	Network,
	Settings,
} from 'lucide-react';

export function More({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	const project = select(
		state,
		'Project',
		state.projectId,
		getInclude(Project_$organizationData),
	);
	const { organization } = project;

	const toolbarContainerElement = useToolbarElement();

	const isMac = window.navigator.userAgent.includes('Mac');
	const isUserInOrganization = state.actorOrganizationMemberId !== null;

	const projectLivePreview = select(
		state,
		'ProjectLivePreview',
		state.projectLivePreviewId,
		getInclude(ProjectLivePreview_$createdByUserData),
	);

	return (
		<>
			<Popover open={state.isMoreMenuOpen}>
				<PopoverTrigger asChild>
					<ToolbarButton
						onClick={() => context.store.setState({ isMoreMenuOpen: true })}
						context={context}
						tooltipName="Menu"
						icon={<MoreHorizontal size={16} />}
						isSelected={state.isMoreMenuOpen}
						disabled={state.isCountingDown}
					/>
				</PopoverTrigger>

				<PopoverContent
					onPointerDownOutside={() => {
						context.store.setState({ isMoreMenuOpen: false });
					}}
					onPointerDown={(e) => {
						e.stopPropagation();
					}}
					onClick={(e) => e.stopPropagation()}
					sideOffset={16}
					container={toolbarContainerElement}
					className="bg-neutral-700 w-[212px] shadow-modal-primary p-1 gap-y-1 flex flex-col justify-start items-start"
					side={state.toolbar.pos === 'top-center' ?
						'bottom' :
						state.toolbar.pos === 'bottom-center' ?
						'top' :
						state.toolbar.pos === 'center-left' ?
						'right' :
						'left'}
				>
					{isUserInOrganization && (
						<>
							<MuratDropdownMenuItem
								as="a"
								href={`${
									ApiUrl.getWebappUrl({
										fromRelease: RELEASE,
										withScheme: true,
									})
								}/${organization.slug}/projects/${project.slug}`}
								target="_blank"
							>
								<ExternalLink size={16} />
								Go to Project
							</MuratDropdownMenuItem>
							<div className="w-full h-[0.5px] bg-[#ffffff10]" />
						</>
					)}
					<MuratDropdownMenuItem
						onClick={() => {
							context.store.setState({
								isShareDialogOpen: false,
								isInboxOpen: false,
								isMoreMenuOpen: false,
								isSettingsDialogOpen: false,
								isGithubDialogOpen: false,
								isPortDialogOpen: false,
							});

							context.store.setState({
								isToolbarHidden: true,
							});
						}}
					>
						<EyeOff size={16} />
						<div className="flex flex-row justify-between items-center w-full">
							<p>Hide toolbar</p>
							<div className="flex flex-row justify-center items-center gap-x-1 font-light text-[10px]">
								<div
									className={cn(
										'h-5 flex justify-center items-center rounded-[5px] text-neutral-200 border-[0.5px] border-solid border-[#ffffff10]',
										isMac && 'w-5 p-1',
										!isMac && 'py-1 px-2',
									)}
								>
									{isMac ? '⌘' : 'Ctrl'}
								</div>
								<div className="w-5 h-5 flex justify-center items-center p-1 rounded-[5px] text-neutral-200 border-[0.5px] border-solid border-[#ffffff10]">
									<div className="h-1.5 w-1.5 bg-neutral-200 rounded-full">
									</div>
								</div>
							</div>
						</div>
					</MuratDropdownMenuItem>
					{isContext(context, state, {
						actorType: 'User',
						isOnline: true,
						hasProject: true,
					}) &&
						(
							<MuratDropdownMenuItem
								onClick={() => {
									context.store.setState({
										isSettingsDialogOpen: true,
										isMoreMenuOpen: false,
									});
								}}
							>
								<Settings size={16} />
								Settings
							</MuratDropdownMenuItem>
						)}
					{isContext(context, state, {
						actorType: 'User',
						isOnline: true,
						hasTunnelInstanceProxyPreview: true,
						hasProjectLivePreview: true,
					}) &&
						(projectLivePreview?.createdByUser?._id === state.actor.data.id) &&
						(
							<MuratDropdownMenuItem
								onClick={() => {
									context.store.setState({
										isMoreMenuOpen: false,
										isPortDialogOpen: true,
									});
								}}
							>
								<Network size={16} />
								Manage ports
							</MuratDropdownMenuItem>
						)}
					{!organization.githubOrganization ?
						(
							<MuratDropdownMenuItem
								as="a"
								href={getGithubAuthUrl({
									organizationId: organization._id,
									organizationMemberId: state.actorOrganizationMemberId ?? '',
									redirectPath: null,
								})}
							>
								<Github size={16} />
								Connect GitHub
							</MuratDropdownMenuItem>
						) :
						(
							<MuratDropdownMenuItem
								className="w-full flex flex-row justify-start items-center overflow-hidden"
								onClick={() => {
									context.store.setState({
										isMoreMenuOpen: false,
										isGithubDialogOpen: true,
									});
								}}
							>
								<Github size={16} className="min-w-max" />
								<span className="text-ellipsis overflow-hidden whitespace-nowrap">
									{project.githubRepository ?
										project.githubRepository.full_name :
										'Connect repository'}
								</span>
							</MuratDropdownMenuItem>
						)}
					<MuratDropdownMenuItem
						variant="danger"
						onClick={async () => {
							const pageToolbarSecretStorage = getPageToolbarSecretStorage();
							await pageToolbarSecretStorage.set({
								actorUserId: null,
								accessToken: null,
								refreshToken: null,
							});

							if (
								isContext(context, state, {
									hostEnvironmentType: HostEnvironmentType.wrapperCommand,
									hostnameType: 'local',
								})
							) {
								const { localProxyTrpc } = getLocalProxyTrpc({ context });
								(await localProxyTrpc.auth.signOut.mutate({})).unwrapOrThrow();
							}

							logout({ context });
						}}
					>
						<LogOut
							size={16}
							className="group-hover:text-muratred-base transition-all"
						/>
						Sign Out
					</MuratDropdownMenuItem>
				</PopoverContent>
			</Popover>
			{isContext(context, state, {
				actorType: 'User',
				isOnline: true,
				hasTunnelInstanceProxyPreview: true,
				hasProjectLivePreview: true,
			}) &&
				(
					<PortDialog
						isOpen={state.isPortDialogOpen}
						setIsOpen={(open: boolean) => {
							context.store.setState({
								isPortDialogOpen: open,
							});
						}}
						context={context}
					/>
				)}
			{isContext(context, state, {
				actorType: 'User',
				isOnline: true,
				hasProjectLivePreview: true,
			}) && (
				<GithubRepositoryDialog
					context={context}
					isOpen={state.isGithubDialogOpen}
					setIsOpen={(open: boolean) => {
						context.store.setState({
							isGithubDialogOpen: open,
						});
					}}
				/>
			)}
			{isContext(context, state, {
				actorType: 'User',
				isOnline: true,
				hasProject: true,
			}) && (
				<SettingsDialog
					context={context}
				/>
			)}
		</>
	);
}
