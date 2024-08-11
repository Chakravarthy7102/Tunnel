/* eslint-disable complexity -- TODO */
'use client';

import { BadgesRow } from '#components/thread-input/badges-row.tsx';
import { FilesRow } from '#components/thread-input/files-row.tsx';
import { IntegrationDialog } from '#components/thread-input/integration-dialog.tsx';
import { TiptapEditor } from '#components/tiptap/editor.tsx';
import { useComments } from '#hooks/comments.ts';
import { useAsana } from '#hooks/new-thread/asana.ts';
import { useJira } from '#hooks/new-thread/jira.ts';
import { useLinear } from '#hooks/new-thread/linear.ts';
import { useLogs } from '#hooks/new-thread/logs.ts';
import { useSendIntegrations } from '#hooks/new-thread/send-integrations.ts';
import { useSlack } from '#hooks/new-thread/slack.ts';
import {
	useThreadInputEditorKeydownHandler,
	useThreadInputEditorProps,
	useThreadInputFileButtonProps,
} from '#hooks/thread-input.ts';
import type { CommentsContext } from '#types';
import {
	type ClientBaseDoc,
	type ClientDoc,
	type ClientFlatDoc,
	createDoc,
	select,
} from '@-/client-doc';
import {
	createCid,
	createIdPair,
} from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	type Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	type Project_$commentsProviderData,
	type ProjectComment_$commentsProviderData,
	type ProjectCommentThread_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import { Button, cn } from '@-/design-system/v1';
import { RELEASE } from '@-/env/app';
import type { ProjectCommentThreadGitMetadata } from '@-/git-metadata';
import { logger } from '@-/logger';
import { toast } from '@-/tunnel-error';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';
import type { WindowMetadata } from '@-/window-metadata';
import type { Editor } from '@tiptap/react';
import { ChevronDown, History, Image } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

export interface NewThreadInputProps {
	commentsContext: CommentsContext;
	pageProps?: {
		route: string;
		anchorElementXpath: string | null;
		xpathType: string;
		percentageLeft: number;
		percentageTop: number;
	};
	editor: Editor;
	windowProps: WindowMetadata | null;
	gitMetadata: ProjectCommentThreadGitMetadata | null;
	files: File[];
	setFiles: Dispatch<SetStateAction<File[]>>;
	initialFilePromise?: Promise<File | null>;
	organization: ClientDoc<typeof Organization_$commentsProviderData>;
	project: ClientDoc<typeof Project_$commentsProviderData> | null;
	linkedProjectLivePreview:
		| ClientBaseDoc<'ProjectLivePreview'>
		| null;
	projectSelectComponent?: JSX.Element;
	onSubmit?(args: {
		commentThread: ClientFlatDoc<
			typeof ProjectCommentThread_$commentsProviderData
		>;
	}): void;
	shouldUploadLogs: boolean;
	sessionEventsFile: File | null;
	sessionEventsThumbnailFile: File | null;
	shouldAutomaticallySendSessionEvents: boolean;
}

export function ToolbarNewThreadInput({
	commentsContext,
	pageProps,
	editor,
	windowProps,
	gitMetadata: gitMetadataData,
	initialFilePromise: initFile,
	linkedProjectLivePreview,
	onSubmit,
	organization,
	project,
	sessionEventsFile,
	sessionEventsThumbnailFile,
	shouldAutomaticallySendSessionEvents,
	shouldUploadLogs,
	files,
	setFiles,
}: NewThreadInputProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
	const [integrationPage, setIntegrationPage] = useState<
		'jira' | 'home' | 'slack' | 'asana' | 'linear'
	>('home');

	// file state
	const [sessionEvents, setSessionEvents] = useState<File | null>(
		shouldAutomaticallySendSessionEvents ? sessionEventsFile : null,
	);
	const [sessionEventsThumbnail, setSessionEventsThumbnail] = useState<
		File | null
	>(
		shouldAutomaticallySendSessionEvents ? sessionEventsThumbnailFile : null,
	);
	const [initialFilePromise, setInitialFilePromise] = useState<
		Promise<File | null> | null
	>(initFile ?? null);

	useEffect(() => {
		setInitialFilePromise(initFile ?? null);
	}, [initFile]);

	useEffect(() => {
		setSessionEventsThumbnail(
			shouldAutomaticallySendSessionEvents ? sessionEventsThumbnailFile : null,
		);
	}, [sessionEventsThumbnailFile]);

	const {
		commentsState,
		setCommentsState,
		setFocusedCommentThread,
		addCommentThread,
		addComment,
	} = useComments(commentsContext);

	const actorUser = select(
		commentsState,
		'User',
		commentsState.actorUserId,
		getInclude(User_$profileData),
	);

	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	const { jiraIssue, setJiraIssue, jiraContext, jiraDefault, createJiraIssue } =
		useJira({
			commentsContext,
			organization,
			actorUser,
			actorOrganizationMember,
			project,
		});

	const {
		linearDefault,
		linearIssue,
		setLinearIssue,
		linearContext,
		createLinearIssue,
	} = useLinear({
		commentsContext,
		organization,
		actorUser,
		actorOrganizationMember,
		project,
	});

	const {
		asanaDefault,
		asanaTask,
		setAsanaTask,
		asanaContext,
		createAsanaTask,
	} = useAsana({
		commentsContext,
		organization,
		actorUser,
		actorOrganizationMember,
		project,
	});

	const { slackContext, slackMessage, setSlackMessage, createSlackMessage } =
		useSlack({
			commentsContext,
			project,
			actorUser,
			actorOrganizationMember,
			organization,
		});

	const { sendIntegrations } = useSendIntegrations({
		jiraIssue,
		linearIssue,
		slackMessage,
		asanaTask,
		createJiraIssue,
		createLinearIssue,
		createAsanaTask,
		createSlackMessage,
		commentsContext,
	});

	const { getNetworkLogEntries, getConsoleLogEntries } = useLogs({
		shouldUploadLogs,
	});

	const isEditorEmpty = editor.getText().trim() === '';

	const handleSubmit = () => {
		if (isEditorEmpty || project === null) return;

		setIsLoading(true);
		const text = editor.getText();

		const [
			setProjectCommentThreadWindowMetadataServerId,
			projectCommentThreadWindowMetadataClientId,
		] = createIdPair('ProjectCommentThreadWindowMetadata');

		const windowMetadata = windowProps === null ?
			null :
			{
				_id: projectCommentThreadWindowMetadataClientId,
				_creationTime: Date.now(),
				...windowProps,
			};

		const [
			setProjectCommentThreadGitMetadataServerId,
			projectCommentThreadGitMetadataClientId,
		] = createIdPair('ProjectCommentThreadGitMetadata');

		const gitMetadata = gitMetadataData === null ?
			null :
			{
				_id: projectCommentThreadGitMetadataClientId,
				_creationTime: Date.now(),
				...gitMetadataData,
			};

		const [
			setProjectCommentThreadServerId,
			projectCommentThreadClientId,
		] = createIdPair('ProjectCommentThread');

		const createCommentThreadAction = createDoc.action(
			'ProjectCommentThread',
			(create) =>
				create<typeof ProjectCommentThread_$commentsProviderData>({
					_id: projectCommentThreadClientId,
					_creationTime: Date.now(),
					slug: createCid(),
					project: { _id: project._id },
					updatedAt: Date.now(),
					comments: [],
					route: pageProps?.route ?? '/',
					anchorElementXpath: pageProps?.anchorElementXpath ?? null,
					xpathType: pageProps?.xpathType ?? '',
					percentageLeft: pageProps?.percentageLeft ?? 0,
					percentageTop: pageProps?.percentageTop ?? 0,
					resolvedByUser: null,
					windowMetadata_: windowMetadata,
					// dprint-ignore
					gitMetadata_: gitMetadata,
					linkedProjectLivePreview: linkedProjectLivePreview === null ?
						null :
						{ _id: linkedProjectLivePreview._id },
					slackMetadata: null,
					jiraIssueRelation: null,
					slackMessageRelation: null,
					linearIssueRelation: null,
					asanaTaskRelation: null,
					networkLogEntriesFile: null,
					networkLogEntriesCount: 0,
					consoleLogsFile: null,
					consoleLogEntriesCount: 0,
					sessionEventsFile: null,
					sessionEventsThumbnailFile: null,
					organization,
				}),
		);

		const [
			setProjectCommentServerId,
			projectCommentClientId,
		] = createIdPair('ProjectComment');

		const createCommentAction = createDoc.action(
			'ProjectComment',
			(create) =>
				create<typeof ProjectComment_$commentsProviderData>({
					_id: projectCommentClientId,
					_creationTime: Date.now(),
					content: editor.getJSON().content ?? [],
					contentTextContent: text,
					files: [],
					authorUser: { _id: commentsState.actorUserId },
					updatedAt: Date.now(),
					parentCommentThread: { _id: createCommentThreadAction._id },
					slackMetadata: null,
					sentBySlack: false,
					authorInformation: null,
				}),
		);

		addCommentThread.server((state) => {
			state = createCommentThreadAction(state);
			state = createCommentAction(state);
			state = addComment.action({ comment: createCommentAction.flatDoc })(
				state,
			);
			return addCommentThread.action({
				commentThreadId: createCommentThreadAction._id,
			})(state);
		}, {
			commentThread: createCommentThreadAction.flatDoc,
			firstComment: createCommentAction.flatDoc,
			files,
			consoleLogs: getConsoleLogEntries(),
			networkLogEntries: getNetworkLogEntries(),
			sessionEventsFile: sessionEvents,
			sessionEventsThumbnailFile: sessionEventsThumbnail,
		}).then(async (result) => {
			if (result.isErr()) {
				toast.error('Failed to create comment');
				return;
			}

			const projectCommentThread = result.value;
			setProjectCommentThreadWindowMetadataServerId(
				projectCommentThread.windowMetadata_?._id,
			);
			setProjectCommentThreadGitMetadataServerId(
				projectCommentThread.gitMetadata_?._id,
			);
			setProjectCommentThreadServerId(
				projectCommentThread._id,
			);
			setProjectCommentServerId(
				projectCommentThread.comments[0]?._id,
			);

			return sendIntegrations({
				text,
				commentThreadId: projectCommentThread._id,
				files: result.value.files,
				tunnelUrl: linkedProjectLivePreview === null ?
					ApiUrl.getWebappUrl({
						fromRelease: RELEASE,
						withScheme: true,
						path: `/${organization.slug}/projects/${project.slug}`,
					}) :
					getReleaseProjectLivePreviewUrl({
						hostname: linkedProjectLivePreview.url,
						path: `${
							pageProps?.route ?? '/'
						}#tunnel_comment=${projectCommentThread._id}`,
						withScheme: true,
					}),
			});
		}).catch((error) => {
			logger.error(error);
		});

		onSubmit?.({ commentThread: createCommentThreadAction.flatDoc });

		editor.commands.clearContent();
		editor.commands.setContent('');
		setFiles([]);
		setIsLoading(false);
		setJiraIssue(jiraDefault);
		setLinearIssue(linearDefault);
		setSlackMessage(
			project.slackChannel ?
				{ channel: project.slackChannel } :
				null,
		);
		setAsanaTask(asanaDefault);
		setCommentsState(
			setFocusedCommentThread.action({
				commentThreadId: createCommentThreadAction._id,
			}),
		);
	};

	useThreadInputEditorKeydownHandler({ editor, onSubmit: handleSubmit });

	const editorProps = useThreadInputEditorProps({
		editor,
		onSubmit: handleSubmit,
		setFiles,
	});
	const fileButtonProps = useThreadInputFileButtonProps({
		setFiles,
	});

	return (
		<div className="flex flex-col justify-center items-center bg-neutral-700">
			<div className="flex flex-col justify-start items-start w-full py-4 min-h-[48px] gap-y-4">
				<TiptapEditor
					className={'w-full text-neutral-0 font-normal text-sm placeholder:text-neutral-400 text-left px-4 cursor-text'}
					{...editorProps}
				/>
				<FilesRow
					commentsContext={commentsContext}
					files={files}
					setFiles={setFiles}
					sessionEventsFile={sessionEvents}
					sessionEventsThumbnailFile={sessionEventsThumbnail}
					setSessionEvents={setSessionEvents}
					setSessionEventsThumbnail={setSessionEventsThumbnail}
					initialFilePromise={initialFilePromise}
					setInitialFilePromise={setInitialFilePromise}
					className="w-full px-4"
				/>
			</div>
			<div className="flex flex-row justify-between items-center bg-neutral-600 border border-t border-[#ffffff10] p-2 w-full">
				<div className="flex flex-row justify-center items-center gap-x-1">
					<div>
						<Button
							variant="muratsecondary"
							onClick={fileButtonProps.handleClick}
							className="w-7 h-7 p-0 rounded-[10px]"
						>
							<Image size={16} />
						</Button>

						<input
							type="file"
							style={{ display: 'none' }}
							ref={fileButtonProps.fileInput}
							onChange={fileButtonProps.handleFileChange}
							accept="image/*"
						/>
					</div>
					{project?.isSessionRecordingEnabled &&
						!shouldAutomaticallySendSessionEvents && !sessionEvents &&
						!sessionEventsThumbnail && (
						<Button
							onClick={() => {
								setSessionEvents(sessionEventsFile);
								setSessionEventsThumbnail(sessionEventsThumbnailFile);
							}}
							variant="muratsecondary"
							className="w-7 h-7 p-0 rounded-[10px]"
						>
							<History size={16} />
						</Button>
					)}
					<BadgesRow
						jiraIssue={jiraIssue}
						linearIssue={linearIssue}
						slackMessage={slackMessage}
						asanaTask={asanaTask}
						setIntegrationPage={setIntegrationPage}
						setIsIntegrationDialogOpen={setIsIntegrationDialogOpen}
						isToolbar={true}
					/>
				</div>

				<div className="flex flex-row justify-center shadow-button-primary focus-within:shadow-button-focus-blue rounded-[8px]">
					<Button
						variant="muratblue"
						size="muratxs"
						disabled={isEditorEmpty || isLoading || project === null}
						isLoading={isLoading}
						onClick={handleSubmit}
						className={cn(
							actorOrganizationMember ? 'rounded-r-none' : '',
							'!p-2 !h-7 border border-solid !border-[#ffffff10] border-r-none shadow-none focus:shadow-none',
						)}
					>
						Create
					</Button>

					<IntegrationDialog
						slackContext={slackContext}
						linearContext={linearContext}
						asanaContext={asanaContext}
						jiraContext={jiraContext}
						isOpen={isIntegrationDialogOpen}
						setIsOpen={setIsIntegrationDialogOpen}
						commentsContext={commentsContext}
						disabled={isEditorEmpty || isLoading || project === null}
						page={integrationPage}
						setPage={setIntegrationPage}
						editor={editor}
						linearIssue={linearIssue}
						setLinearIssue={setLinearIssue}
						slackMessage={slackMessage}
						setSlackMessage={setSlackMessage}
						jiraIssue={jiraIssue}
						setJiraIssue={setJiraIssue}
						asanaTask={asanaTask}
						setAsanaTask={setAsanaTask}
						organization={organization}
						button={
							<Button
								variant="muratblue"
								size="muratxs"
								className="h-7 w-7 !p-0 rounded-l-none border border-solid !border-[#ffffff10] shadow-none focus:shadow-none"
								disabled={isEditorEmpty || isLoading || project === null}
							>
								<ChevronDown size={16} />
							</Button>
						}
					/>
				</div>
			</div>
		</div>
	);
}
