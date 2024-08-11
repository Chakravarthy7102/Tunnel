import { PortProxyingNoticeDialogs } from '#components/port-proxying-notice-dialogs.tsx';
import { PortProxyingPermissionPrompts } from '#components/port-proxying-permission-prompts.tsx';
import { ToastContainer } from '#components/toast/toast-container.tsx';
import { ActiveUsers } from '#components/toolbar/sections/active-users.tsx';
import { CommentActions } from '#components/toolbar/sections/comment-actions.tsx';
import { Login } from '#components/toolbar/sections/login.tsx';
import { MoreActions } from '#components/toolbar/sections/more-actions.tsx';
import { ToolbarContainer } from '#components/toolbar/toolbar-container.tsx';
import { useClient } from '#hooks/client.ts';
import { useHidePill } from '#hooks/hide-pill.ts';
import { useHighlighter } from '#hooks/highlighter.ts';
import { ToolbarProvider } from '#providers/_provider.tsx';
import type { PageToolbarContext } from '#types';
import { logout } from '#utils/authentication.ts';
import { isContext } from '#utils/context/_.ts';
import { useContextStore } from '#utils/context/use.ts';
import { useOnceEffect } from '#utils/effect.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { select } from '@-/client-doc';
import { SonnerToaster, TooltipProvider } from '@-/design-system/v1';
import { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { UserAvatar } from '@-/user/components';
import destr from 'destru';
import { LogOut } from 'lucide-react';
import { useEffect } from 'react';
import * as rrweb from 'rrweb';
import { CommentCursor, CommentModeCursor } from './cursors/comment-cursor.tsx';
import { SETTINGS } from './dialogs/triggers/tunnel-settings-button.tsx';
import { SelectProject } from './select-project.tsx';
import { SwitchAccountsAvatar } from './switch-accounts-avatar.tsx';
import { ToolbarComments } from './toolbar-comments.tsx';
import {
	MissingDataProjectId,
	ProjectNotFound,
} from './toolbar/sections/project-not-found.tsx';

// eslint-disable-next-line complexity -- TODO
export function Toolbar({ context }: { context: PageToolbarContext }) {
	const state = useContextStore(context);
	const savedSettingsJson = localStorage.getItem('tunnel-settings');
	const savedSettings = savedSettingsJson ?
		(destr(savedSettingsJson) as any) :
		{};
	const { projectId } = context.store.getState();
	const project = select(state, 'Project', projectId);

	useOnceEffect(() => {
		if (!savedSettingsJson) {
			const defaultSettings: { [key: string]: string | boolean } = {};

			for (const setting of SETTINGS) {
				defaultSettings[setting.key] = setting.default;
			}

			localStorage.setItem('tunnel-settings', JSON.stringify(defaultSettings));
		}

		state.settings = savedSettings;
	});

	useEffect(() => {
		void (async () => {
			if (
				isContext(context, state, {
					actorType: 'User',
					isOnline: true,
					hasProject: true,
				})
			) {
				const { projectId, actor } = context.store.getState();
				const project = select(state, 'Project', projectId);
				if (project.isUnnamed) {
					const { webappTrpc } = getWebappTrpc({ context });
					const result = await webappTrpc.project.update.mutate({
						actor,
						project: {
							id: projectId,
						},
						updates: {
							name: document.title.slice(0, 32),
						},
					});

					if (result.isErr()) {
						logger.error('Failed to automatically update project name');
					}
				}
			}
		})();
	}, [state.projectId]);

	const { isClient } = useClient();

	useHidePill({ context });
	useHighlighter({ context });
	const shadowRootElement = useShadowRootElement();

	useEffect(() => {
		const tunnelGlobals = getTunnelGlobals();

		if (!tunnelGlobals) return;

		const { sessionBuffer } = tunnelGlobals;

		if (!sessionBuffer) return;

		if (!project?.isSessionRecordingEnabled) return;

		rrweb.record({
			slimDOMOptions: 'all',
			collectFonts: true,
			checkoutEveryNms: 30 * 1000, // void 0
			blockSelector: 'iframe,tunnel-toolbar',
			maskInputOptions: {
				email: true,
				tel: true,
				text: true,
				password: true,
			},
			// maskTextFn: (e) => '*'.repeat(e.length),
			// maskInputFn: (e, t) => {
			// 	if (!t) return e;
			// 	if (
			// 		'input' === t.tagName.toLowerCase() &&
			// 		'text' === t.type.toLowerCase()
			// 	) {
			// 		const n = t.getAttribute('name');
			// 		if (!n || !zd.test(n)) return e;
			// 	}
			// 	return '*'.repeat(e.length);
			// },
			recordCanvas: false,
			sampling: {
				mousemove: true,
				mouseInteraction: false,
				scroll: 100,
				input: 'all',
				media: 500,
			},

			emit(event, isCheckout) {
				if (isCheckout && event.type === rrweb.EventType.Meta) {
					if (sessionBuffer.events.length > 1) {
						sessionBuffer.events.shift();
					}

					sessionBuffer.events.push([]);
				}

				const lastEvents = sessionBuffer.events.at(-1) as any[];

				lastEvents.push(event);
			},
			/*
				((e) => {
					r.emittedEventCount++,
						e.type === Cf.FullSnapshot &&
							r.emittedFullSnapshotCount++,
						i.add({
							type: e.type,
							timestamp: e.timestamp,
							data: JSON.stringify(e),
						});
				})({
					...e,
					hostname: window.location.hostname,
					origin: window.location.origin,
				});
		*/
		});
	}, [state.projectId, project?.isSessionRecordingEnabled]);

	if (!isClient) {
		return null;
	}

	const toolbarContainer = (() => {
		if (state.hasInsufficientPermissions) {
			const actorUser = select(
				state,
				'User',
				// @ts-expect-error: handle the case where the actor is null
				state.actor.data.id,
			);

			return (
				<ToolbarContainer context={context}>
					<button
						className="hover:bg-black-700 w-full h-full"
						// @ts-expect-error: TODO
						onClick={async () => logout({ context })}
					>
						<div className="flex flex-col items-center gap-y-1">
							<div className="flex flex-row items-center">
								<UserAvatar
									size="sm"
									profileImageUrl={actorUser.profileImageUrl}
									name={actorUser.fullName}
								/>
								<div className="p-2 text-sm text-gray-200">
									<p>{actorUser.email}</p>
								</div>
							</div>
							<div className="flex flex-row items-center text-white gap-1">
								<LogOut size={14} />
								<p className="text-xs">Logout</p>
							</div>
						</div>
					</button>
				</ToolbarContainer>
			);
		}

		return (
			<ToolbarContainer context={context}>
				{isContext(context, state, {
					actorType: 'User',
					hasProject: true,
					isOnline: true,
				}) && <CommentActions context={context} />}

				{isContext(context, state, {
					actorType: 'User',
					hasProject: true,
					hasProjectLivePreview: true,
				}) && !state.isRecording && <ActiveUsers context={context} />}
				{isContext(context, state, {
					actorType: null,
					isOnline: true,
				}) && <Login context={context} />}

				{
					// When using the wrapper command for the first name, the user needs to select a project to associate with
					isContext(context, state, {
						hostEnvironmentType: HostEnvironmentType.wrapperCommand,
						actorType: 'User',
						hasProject: false,
						hostnameType: 'local',
						isOnline: true,
					}) && (
						<div className="flex flex-row items-center">
							<div className="flex-shrink flex flex-row items-center">
								<SwitchAccountsAvatar context={context} />
							</div>
							<div className="flex-1">
								<SelectProject context={context} />
							</div>
						</div>
					)
				}

				{isContext(context, state, {
					actorType: 'User',
					isOnline: true,
					hasProject: true,
				}) && !state.isRecording && <MoreActions context={context} />}
			</ToolbarContainer>
		);
	})();

	return (
		<ToolbarProvider context={context}>
			<TooltipProvider>
				{/* <CommandMenu /> */}
				<SonnerToaster container={shadowRootElement} />
				<div className="injection dark font-sans">
					{toolbarContainer}

					{/* Don't want to remove this from the tree, this is the functionality of the pill element */}
					<div className={state.isToolbarHidden ? 'hidden' : ''}>
						<ToastContainer context={context} />
						{isContext(context, state, {
							hasProject: true,
							actorType: 'User',
						}) &&
							state.isCommentCursorVisible &&
							(state.commentBoxPosition === null ?
								<CommentModeCursor context={context} /> :
								(
									<CommentCursor
										context={context}
										x={state.commentBoxPosition.x}
										y={state.commentBoxPosition.y}
									/>
								))}
						{isContext(context, state, {
							actorType: 'User',
							hasProject: true,
							isOnline: true,
						}) && <ToolbarComments context={context} />}
						{isContext(context, state, {
							actorType: 'User',
							isOnline: true,
							hasProjectLivePreview: true,
							hasTunnelInstanceProxyPreview: true,
						}) && <PortProxyingPermissionPrompts context={context} />}
						{isContext(context, state, {
							isOnline: true,
							hasTunnelInstanceProxyPreview: true,
						}) && <PortProxyingNoticeDialogs context={context} />}
						{
							/* dprint-ignore */
							isContext(context, state, {
								actorType: 'User',
								hasProject: false,
								hostEnvironmentType: HostEnvironmentType.scriptTag,
								isOnline: true
							}) &&
							(context.hostEnvironment as any).projectId === undefined &&
							<MissingDataProjectId context={context} />
						}
						{
							/* dprint-ignore */
							isContext(context, state, {
								actorType: 'User',
								hasProject: false,
								hostEnvironmentType: HostEnvironmentType.scriptTag,
								isOnline: true
							}) &&
							(context.hostEnvironment as any).projectId &&
							getTunnelGlobals()?.tunneledServiceEnvironmentData?.project === null &&
							<ProjectNotFound _context={context} projectId={(context.hostEnvironment as any).projectId} />
						}
					</div>
				</div>
			</TooltipProvider>
		</ToolbarProvider>
	);
}
