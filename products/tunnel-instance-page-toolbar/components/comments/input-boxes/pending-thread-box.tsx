import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { getEnvironmentGitMetadataPayload } from '#utils/git.ts';
import { getBrowser, getOS } from '#utils/window-metadata.ts';
import { select } from '@-/client-doc';
import { ToolbarNewThreadInput } from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$commentsProviderData,
	Project_$commentsProviderData,
	ProjectLivePreview_$commentsProviderData,
} from '@-/database/selections';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

export function PendingThreadBox({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		isOnline: true;
		actorType: 'User';
	}>;
}) {
	const state = useContextStore(context);
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerHeight, setContainerHeight] = useState(0);

	const commentsContext = useCommentsContext({ context });
	const project = select(
		state,
		'Project',
		state.projectId,
		getInclude(Project_$commentsProviderData),
	);
	const projectLivePreview = select(
		state,
		'ProjectLivePreview',
		state.projectLivePreviewId,
		getInclude(ProjectLivePreview_$commentsProviderData),
	);
	const organization = select(
		state,
		'Organization',
		project.organization._id,
		getInclude(Organization_$commentsProviderData),
	);
	const editor = useFullEditor({
		commentsContext,
		organization,
	});

	const environmentGitMetadataPayload = getEnvironmentGitMetadataPayload({
		context,
	});

	let sessionEventsFile = null;
	if (state.session !== null && state.session.events.length > 1) {
		const sessionEventsBlob = new Blob([JSON.stringify(state.session.events)], {
			type: 'application/json',
		});
		sessionEventsFile = new File(
			[sessionEventsBlob],
			`${project._id}-session-${Date.now()}.json`,
			{
				type: 'application/json',
			},
		);
	}

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (container) {
			setTimeout(() => {
				const { height } = container.getBoundingClientRect();
				if (height !== containerHeight) {
					setContainerHeight(height);
				}
			}, 0);
		}
	}, [containerHeight]);

	useEffect(() => {
		if (state.pendingNewCommentThread !== null) {
			editor?.commands.focus();
		}
	}, [state.pendingNewCommentThread]);

	const files = useMemo(() => state.pendingNewCommentThread?.files ?? [], [
		state.pendingNewCommentThread?.files,
	]);

	const setFiles: Dispatch<SetStateAction<File[]>> = useCallback(
		(files) => {
			context.store.setState((state) => {
				if (state.pendingNewCommentThread === null) {
					return state;
				}

				return {
					...state,
					pendingNewCommentThread: {
						...state.pendingNewCommentThread,
						files: typeof files === 'function' ?
							files(state.pendingNewCommentThread.files) :
							files,
					},
				};
			});
		},
		[],
	);

	return (
		<>
			<div
				id="pending-thread-box"
				ref={containerRef}
				style={state.pendingNewCommentThread !== null ?
					{
						zIndex: 998,
						top: state.commentBoxPosition ?
							state.commentBoxPosition.y >
									window.innerHeight - containerHeight ?
								window.innerHeight - containerHeight :
								state.commentBoxPosition.y :
							0,

						left: state.commentBoxPosition ?
							state.commentBoxPosition.x > window.innerWidth / 2 ?
								state.commentBoxPosition.x - 320 - 24 :
								state.commentBoxPosition.x + 48 :
							0,
						opacity: 1,
						transform: 'translateY(0px)',
						transition: 'transform ease 200ms, opacity ease 200ms',
					} :
					{
						zIndex: 0,
						top: 0,
						left: 0,
						opacity: 0,
						transform: 'translateY(10px)',
						pointerEvents: 'none',
					}}
				className="fixed flex flex-col justify-start items-stretch rounded-[10px] bg-neutral-700 w-80 text-neutral-0 max-h-screen overflow-auto shadow-comment-shadow-primary"
			>
				{editor !== null && (
					<ToolbarNewThreadInput
						commentsContext={commentsContext}
						organization={organization}
						project={project}
						linkedProjectLivePreview={projectLivePreview}
						onSubmit={() => {
							context.store.setState({
								pendingNewCommentThread: null,
								isCommentCursorVisible: false,
							});
						}}
						gitMetadata={environmentGitMetadataPayload.data === null ?
							null :
							{
								branchName: environmentGitMetadataPayload.data.branch?.name ??
									null,
								commitSha:
									environmentGitMetadataPayload.data.latestCommit?.sha ??
										null,
								gitUrl: environmentGitMetadataPayload.data.gitUrl,
							}}
						pageProps={{
							route: window.location.pathname,
							percentageLeft: state.pendingNewCommentThread?.percentageLeft ??
								0,
							anchorElementXpath:
								state.pendingNewCommentThread?.anchorElementXpath ?? null,
							xpathType: state.pendingNewCommentThread?.xpathType ?? 'similo',
							percentageTop: state.pendingNewCommentThread?.percentageTop ?? 0,
						}}
						editor={editor}
						windowProps={{
							browser: getBrowser(),
							url: window.location.href,
							timestamp: new Date().toISOString(),
							os: getOS(),
							windowSize: {
								width: window.innerWidth,
								height: window.innerHeight,
							},
						}}
						files={files}
						setFiles={setFiles}
						initialFilePromise={state.pendingNewCommentThread?.screenshot ??
							undefined}
						sessionEventsFile={sessionEventsFile}
						sessionEventsThumbnailFile={state.session?.thumbnail ?? null}
						shouldUploadLogs={true}
						shouldAutomaticallySendSessionEvents={false}
					/>
				)}
			</div>
			{state.pendingNewCommentThread && (
				<div
					className="w-screen h-screen fixed inset-0 "
					style={{ zIndex: 997 }}
					onClick={() => {
						context.store.setState({
							isCommentCursorVisible: false,
							pendingNewCommentThread: null,
							commandModePoint: null,
							commentBoxPosition: null,
							session: {
								thumbnail: null,
								events: [],
							},
						});
					}}
				>
				</div>
			)}
		</>
	);
}
