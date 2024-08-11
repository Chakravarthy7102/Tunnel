import { ToolbarButton } from '#components/toolbar/toolbar-button.tsx';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/use.ts';
import { useComments } from '@-/comments';
import { buttonVariants, cn } from '@-/design-system/v1';
import { getRrwebThumbnail } from '@-/rrweb-player';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { useEffect, useRef, useState } from 'react';
import * as rrweb from 'rrweb';

export function ToolbarRecordButton({
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
	const [timer, setTimer] = useState(0);
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

	const [countdownTimer, setCountdownTimer] = useState(0);
	const [countdownIntervalId, setCountdownIntervalId] = useState<
		NodeJS.Timeout | null
	>(null);

	const stopRecordingRef = useRef<(() => void) | null>(null);
	const countingDown = useRef<boolean>(false);

	const startRecording = () => {
		setCountdownTimer(3);
		countingDown.current = true;
		context.store.setState({
			isCountingDown: true,
		});

		if (countdownIntervalId) {
			clearInterval(countdownIntervalId);
			setCountdownIntervalId(null);
		}

		const countdown = setInterval(() => {
			setCountdownTimer((previousTimer: number) => {
				const newTimer = previousTimer - 1;
				if (newTimer === 0) {
					if (countingDown.current) {
						const tunnelGlobals = getTunnelGlobals();
						if (!tunnelGlobals) return previousTimer;
						const { recording } = tunnelGlobals;

						recording.events = [];

						const stop = rrweb.record({
							slimDOMOptions: 'all',
							collectFonts: true,
							blockSelector: 'iframe,tunnel-toolbar',
							maskInputOptions: {
								email: true,
								tel: true,
								text: true,
								password: true,
							},
							recordCanvas: false,
							sampling: {
								mousemove: true,
								mouseInteraction: false,
								scroll: 100,
								input: 'all',
								media: 500,
							},
							emit(event) {
								recording.events.push(event);
							},
						});

						if (stop) {
							stopRecordingRef.current = stop;
						}

						context.store.setState((state) => {
							state = setFocusedCommentThread.action({
								commentThreadId: null,
							})(state);
							return {
								...state,
								isRecording: true,
							};
						});
					}

					clearInterval(countdown);
					countingDown.current = false;
					context.store.setState({
						isCountingDown: false,
					});

					return 0;
				}

				return newTimer;
			});
		}, 1000);

		setCountdownIntervalId(countdown);
	};

	const stopRecording = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals) return;
		const { recording } = tunnelGlobals;

		if (stopRecordingRef.current) {
			stopRecordingRef.current();
			stopRecordingRef.current = null;
		}

		const eventsArray = [...recording.events];

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
						events: eventsArray,
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
	};

	const stopCountdown = () => {
		countingDown.current = false;
		context.store.setState({
			isCountingDown: false,
		});
		if (countdownIntervalId) {
			clearInterval(countdownIntervalId);
			setCountdownIntervalId(null);
			setCountdownTimer(0);
		}
	};

	useEffect(() => {
		if (state.isRecording) {
			const id = setInterval(() => {
				setTimer((previousTimer) => {
					if (previousTimer + 1 === 120) {
						stopRecording();
					}

					return previousTimer + 1;
				});
			}, 1000);
			setIntervalId(id);
		} else {
			if (intervalId) {
				clearInterval(intervalId);
				setIntervalId(null);
			}

			setTimer(0);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}

			if (stopRecordingRef.current) {
				stopRecordingRef.current();
			}
		};
	}, [state.isRecording, stopRecordingRef.current]);

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes < 10 ? '0' : ''}${minutes}:${
			seconds < 10 ? '0' : ''
		}${seconds}`;
	};

	return (
		<div className="flex flex-row justify-center items-center gap-x-1">
			<ToolbarButton
				context={context}
				tooltipName={countingDown.current ?
					'Cancel Recording' :
					state.isRecording ?
					'Stop Recording' :
					'Start Recording'}
				isSelected={state.isRecording || countingDown.current}
				className={cn(
					state.isRecording && buttonVariants({ variant: 'muratred' }),
					'p-0',
				)}
				onClick={async () => {
					if (!countingDown.current && !state.isRecording) {
						startRecording();
					} else if (countingDown.current && !state.isRecording) {
						stopCountdown();
					} else {
						stopRecording();
					}
				}}
				icon={countingDown.current ?
					countdownTimer :
					(
						<div className="bg-inherit rounded-full border border-solid border-neutral-0 flex justify-center items-center h-4 w-4">
							<div
								className={cn(
									'h-[6px] w-[6px]  bg-neutral-0',
									state.isRecording ? 'rounded-[1px]' : 'rounded-full',
								)}
							>
							</div>
						</div>
					)}
			/>
			{state.isRecording && (
				<>
					<div className="h-6 w-[1px] bg-[#ffffff10]"></div>
					<div className="rounded-[8px] bg-[#ffffff10] text-neutral-0 px-2 h-9 flex flex-col justify-center items-center shadow-button-important border-[0.5px] border-solid border-[#ffffff10] tabular-nums text-sm">
						{formatTime(timer)}
					</div>
				</>
			)}
		</div>
	);
}
