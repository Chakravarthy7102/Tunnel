import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/use.ts';
import { useComments } from '@-/comments';
import { getRrwebThumbnail } from '@-/rrweb-player';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { History } from 'lucide-react';

export function ToolbarInstantReplayButton({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		isOnline: true;
		actorType: 'User';
	}>;
}) {
	const state = useContextStore(context);
	const commentsContext = useCommentsContext({ context });
	const { setFocusedCommentThread } = useComments(commentsContext);

	return (
		<ToolbarButton
			context={context}
			isSelected={false}
			disabled={state.isCountingDown}
			tooltipName="Instant Replay"
			icon={<History size={16} />}
			onClick={async () => {
				const tunnelGlobals = getTunnelGlobals();
				if (!tunnelGlobals || !commentsContext.commentsState.container) return;

				const { sessionBuffer } = tunnelGlobals;

				if (!sessionBuffer) return;

				let eventsArray: any[] = [];
				if (
					sessionBuffer.events.length > 0
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
					})(state);
					return {
						...state,
						isRecording: false,
						dialogNewCommentThread: {
							route: window.location.pathname,
							anchorElementXpath: null,
							percentageLeft: 0,
							percentageTop: 0,
							rawText: '',
							fileUploads: [],
							screenshot: [],
							session: {
								events: [...eventsArray],
								thumbnail: null,
							},
						},
					};
				});

				void getRrwebThumbnail({
					eventsArray,
					onFinish(file) {
						const state = context.store.getState();

						if (state.dialogNewCommentThread === null) return;

						context.store.setState((state) => {
							if (state.dialogNewCommentThread === null) return state;

							return {
								...state,
								dialogNewCommentThread: {
									...state.dialogNewCommentThread,
									session: {
										...state.dialogNewCommentThread.session,
										thumbnail: file,
									},
								},
							};
						});
					},
					container: commentsContext.commentsState.container,
				});
			}}
		/>
	);
}
