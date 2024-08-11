import { Avatar } from '#components/avatar.tsx';
import { useContextNotifications } from '#hooks/context/notifications.ts';
import type { Notification, PageToolbarContext } from '#types';
import { getAuthenticateUrl } from '#utils/authentication.ts';
import { useCommentsContext } from '#utils/comment.ts';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { useOnceEffect } from '#utils/effect.ts';
import { zIndex } from '#utils/z-index.ts';
import { select } from '@-/client-doc';
import { ReadTiptapEditor } from '@-/comments/tiptap';
import { createCid } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { AnimatePresence, motion } from 'framer-motion';

function NewProjectCommentToast({
	context,
	notification,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
	}>;
	notification: Notification<'NewProjectComment'>;
}) {
	const state = useContextStore(context);
	const commentsContext = useCommentsContext({ context });
	const notificationAuthorUser = select(
		state,
		'User',
		notification.authorUser._id,
	);

	return (
		<motion.button
			onClick={() => {
				context.store.setState({
					isInboxOpen: true,
					activeCommentThreadId: select(
						state,
						'ProjectCommentThread',
						notification.parentThreadId,
						getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
					)?._id ?? null,
				});
			}}
			key={notification.id}
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			className="flex flex-col w-80 p-4 bg-[#222] border border-solid border-[#333] rounded-[5px] justify-start items-start gap-y-2"
		>
			<div className="flex flex-row w-full justify-start items-center gap-x-2">
				{notificationAuthorUser !== null && (
					<Avatar
						context={context}
						user={notificationAuthorUser}
						isOutlined={false}
					/>
				)}
				<p className="text-white line-clamp-1">
					{notification.authorUser.name}
				</p>
			</div>
			{
				/* <p className="text-sm line-clamp-2 w-full text-left pl-8 text-foreground/80">
								{notification.text}
							</p> */
			}
			<ReadTiptapEditor
				commentsContext={commentsContext}
				content={notification.content as any}
				className="text-sm line-clamp-2 w-full text-left pl-8 text-[#999]"
			/>
		</motion.button>
	);
}

function PortProxyRequestBlockedToast({
	context,
	notification,
}: {
	context: PageToolbarContext;
	notification: Notification<'PortProxyRequestBlocked'>;
}) {
	const state = useContextStore(context);
	// dprint-ignore
	const message =
		notification.isDisallowed ?
			`The host has disabled requests to port ${notification.portNumber}` :
		(state.actor?.data.id ?? null) === null ?
			`The host has not enabled requests to port ${notification.portNumber}; if you are the host, log in to enable requests to this port` :
		`The host has not enabled requests to port ${notification.portNumber}`;

	return (
		<motion.button
			onClick={() => {
				if (
					(state.actor?.data.id ?? null) === null &&
					isContext(context, state, { isOnline: true })
				) {
					window.location.href = getAuthenticateUrl({
						hostnameType: state.hostnameType,
						hostEnvironmentType: state.hostEnvironmentType,
					});
				}
			}}
			key={notification.id}
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			className="flex flex-col w-96 p-4 bg-[#222] border border-solid border-[#333] rounded-[5px] justify-start items-start gap-y-2"
		>
			<div className="flex flex-row w-full justify-start items-center gap-x-2">
				<p className="text-white line-clamp-1">
					Request to port {notification.portNumber} blocked
				</p>
			</div>
			<p className="text-xs line-clamp-2 w-full text-left text-foreground/80">
				{message}
			</p>
		</motion.button>
	);
}

export function ToastContainer({ context }: { context: PageToolbarContext }) {
	const state = useContextStore(context);
	const { addNotification } = useContextNotifications({ context });
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) {
		return null;
	}

	const { portProxying } = tunnelGlobals;

	useOnceEffect(() => {
		return portProxying.onPortProxyRequestBlocked(
			({ portNumber, isDisallowed }) => {
				context.store.setState(
					addNotification.action({
						notification: {
							id: createCid(),
							type: 'PortProxyRequestBlocked',
							portNumber,
							isDisallowed,
						},
					}),
				);
			},
		);
	});

	return (
		<div
			style={{
				zIndex: zIndex.toast,
			}}
			className="fixed bottom-4 right-4 flex flex-col justify-center items-center gap-y-2"
		>
			<AnimatePresence>
				{state.notifications.map((notification) => {
					if (
						isContext(context, state, {
							actorType: 'User',
							hasProject: true,
						}) &&
						notification.type === 'NewProjectComment'
					) {
						return (
							<NewProjectCommentToast
								key={notification.id}
								context={context}
								notification={notification}
							/>
						);
					} else if (notification.type === 'PortProxyRequestBlocked') {
						return (
							<PortProxyRequestBlockedToast
								key={notification.id}
								context={context}
								notification={notification}
							/>
						);
					} else if (notification.type === 'InvalidGitConfiguration') {
						return (
							<InvalidGitConfigurationToast
								key={notification.id}
								context={context}
								notification={notification}
							/>
						);
					} else {
						return null;
					}
				})}
			</AnimatePresence>
		</div>
	);
}

function InvalidGitConfigurationToast({
	notification,
}: {
	context: PageToolbarContext;
	notification: Notification<'InvalidGitConfiguration'>;
}) {
	return (
		<motion.button
			key={notification.id}
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: 'easeInOut' }}
			className="flex flex-col w-80 p-4 bg-[#222] border border-solid border-[#333] rounded-[5px] justify-start items-start gap-y-2"
		>
			<div className="flex flex-row w-full justify-start items-center gap-x-2">
				<p className="text-sm text-white line-clamp-1">
					Invalid Tunnel &lt;script&gt; tag configuration
				</p>
			</div>
			<p className="text-xs line-clamp-2 w-full text-left text-foreground/80">
				{notification.message}
			</p>
		</motion.button>
	);
}
