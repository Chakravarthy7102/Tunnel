import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/use.ts';
import { select } from '@-/client-doc';
import { useComments } from '@-/comments';
import { getRrwebThumbnail } from '@-/rrweb-player';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { MessageCircle } from 'lucide-react';

export function ToolbarCommentButton({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		isOnline: true;
		actorType: 'User';
	}>;
}) {
	const commentsContext = useCommentsContext({ context });
	const { setFocusedCommentThread } = useComments(commentsContext);
	const state = useContextStore(context);
	const project = select(
		state,
		'Project',
		state.projectId,
	);

	return (
		<ToolbarButton
			context={context}
			tooltipName="Comment"
			isSelected={state.isCommentCursorVisible}
			disabled={state.isCountingDown}
			onClick={async () => {
				context.store.setState((state) => {
					state = setFocusedCommentThread.action({
						commentThreadId: null,
					})(
						state,
					);
					return {
						...state,
						isCommentCursorVisible: !state.isCommentCursorVisible,
					};
				});

				const tunnelGlobals = getTunnelGlobals();
				if (!tunnelGlobals) return;

				const { sessionBuffer } = tunnelGlobals;

				if (!sessionBuffer || !commentsContext.commentsState.container) {
					return;
				}

				let eventsArray: any[] = [];
				if (
					sessionBuffer.events.length > 0 && project.isSessionRecordingEnabled
				) {
					if (sessionBuffer.events.length === 1) {
						eventsArray = [...sessionBuffer.events[0] as any[]];
					} else {
						const lastArray = sessionBuffer
							.events.at(-1) as any[];
						const secondLastArray = sessionBuffer
							.events.at(-2) as any[];
						eventsArray = [
							...secondLastArray,
							...lastArray,
						];
					}
				}

				context.store.setState((state) => {
					state = setFocusedCommentThread.action({
						commentThreadId: null,
					})(
						state,
					);
					return {
						...state,
						session: { thumbnail: null, events: [...eventsArray] },
					};
				});

				await getRrwebThumbnail({
					eventsArray,
					onFinish(file) {
						context.store.setState((state) => {
							state = setFocusedCommentThread.action({
								commentThreadId: null,
							})(
								state,
							);
							return {
								...state,
								session: { ...state.session, thumbnail: file },
							};
						});
					},
					container: commentsContext.commentsState.container,
				});
			}}
			icon={<MessageCircle size={16} />}
		/>
	);
}
