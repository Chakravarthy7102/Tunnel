import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { getEnvironmentGitMetadataPayload } from '#utils/git.ts';
import { getBrowser, getOS } from '#utils/window-metadata.ts';
import { select } from '@-/client-doc';
import {
	ToolbarNewThreadInput,
	useComments,
} from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$commentsProviderData,
	Project_$commentsProviderData,
	ProjectLivePreview_$commentsProviderData,
} from '@-/database/selections';
import { useEffect, useState } from 'react';

export function DialogThreadBox({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		isOnline: true;
		actorType: 'User';
	}>;
}) {
	const [files, setFiles] = useState<File[]>([]);
	// const [sessionEventsFile, setSessionEventsFile] = useState<File | null>(null);
	const state = useContextStore(context);
	const project = select(
		state,
		'Project',
		state.projectId,
		getInclude(Project_$commentsProviderData),
	);
	const organization = select(
		state,
		'Organization',
		project.organization._id,
		getInclude(Organization_$commentsProviderData),
	);
	const linkedProjectLivePreview = select(
		state,
		'ProjectLivePreview',
		state.projectLivePreviewId,
		getInclude(ProjectLivePreview_$commentsProviderData),
	);

	const commentsContext = useCommentsContext({ context });
	const { setFocusedCommentThread } = useComments(commentsContext);

	const editor = useFullEditor({
		commentsContext,
		organization,
	});

	const environmentGitMetadataPayload = getEnvironmentGitMetadataPayload({
		context,
	});

	let sessionEventsFile = null;
	if (
		state.dialogNewCommentThread !== null &&
		state.dialogNewCommentThread.session.events.length > 1
	) {
		const sessionEventsBlob = new Blob([
			JSON.stringify(state.dialogNewCommentThread.session.events),
		], {
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

	useEffect(() => {
		if (state.dialogNewCommentThread) {
			setFiles(state.dialogNewCommentThread.screenshot);
		}
	}, [state.dialogNewCommentThread?.screenshot]);

	return (
		<>
			{state.dialogNewCommentThread && (
				<div
					className="rounded-[10px] fixed flex flex-col justify-start items-stretch w-[320px] max-h-screen overflow-auto"
					style={{
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						zIndex: 998,
					}}
				>
					{editor !== null && (
						<ToolbarNewThreadInput
							commentsContext={commentsContext}
							project={project}
							organization={organization}
							linkedProjectLivePreview={linkedProjectLivePreview}
							onSubmit={() => {
								context.store.setState({ dialogNewCommentThread: null });
								setFiles([]);
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
								percentageLeft: state.dialogNewCommentThread.percentageLeft,
								anchorElementXpath:
									state.dialogNewCommentThread.anchorElementXpath,
								xpathType: state.dialogNewCommentThread.xpathType,
								percentageTop: state.dialogNewCommentThread.percentageTop,
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
							sessionEventsFile={sessionEventsFile}
							sessionEventsThumbnailFile={state.dialogNewCommentThread.session
								.thumbnail}
							shouldUploadLogs={true}
							shouldAutomaticallySendSessionEvents={true}
						/>
					)}
				</div>
			)}

			{state.dialogNewCommentThread && (
				<div
					className="w-screen h-screen fixed inset-0 bg-black/20"
					style={{
						zIndex: 997,
					}}
					onClick={() => {
						context.store.setState((state) => {
							state = setFocusedCommentThread.action({
								commentThreadId: null,
							})(state);
							return {
								...state,
								dialogNewCommentThread: null,
								session: {
									thumbnail: null,
									events: [],
								},
							};
						});
						setFiles([]);
					}}
				>
				</div>
			)}
		</>
	);
}
