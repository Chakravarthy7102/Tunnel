/* eslint-disable complexity -- disabled */

'use client';

import { EnvironmentDialogButton } from '#components/dialogs/environment-dialog-button.tsx';
import { ExpandableImage } from '#components/expandable-image.tsx';
import { ReadTiptapEditor } from '#components/tiptap/editor.tsx';
import { useComments } from '#hooks/comments.ts';
import type { CommentsContext } from '#types';
import { type ClientDoc, select } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$actorProfileData,
	type ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import {
	AspectRatio,
	Badge,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { RELEASE } from '@-/env/app';
import { getFileUrl } from '@-/file';
import {
	AsanaConnectDialog,
	AsanaIcon,
	JiraConnectDialog,
	JiraIcon,
	LinearConnectDialog,
	LinearIcon,
	SlackIcon,
} from '@-/integrations/components';
import { logger } from '@-/logger';
import { RrwebPlayerPreviewFromFileDoc } from '@-/rrweb-player';
import { toast } from '@-/tunnel-error';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';
import { UserAvatar } from '@-/user/components';
import { dayjs } from '@tunnel/dayjs';
import {
	Eye,
	MessageCircle,
	MoreHorizontal,
	ThumbsDown,
	ThumbsUp,
	Trash2,
} from 'lucide-react';
import { useState } from 'react';

export function ThreadPreviewCard({
	pageInjectionContext,
	commentsContext,
	commentThread,
	onExpand,
	showProject,
}: {
	pageInjectionContext?: any;
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
	onExpand: () => void;
	showProject: boolean;
}) {
	const [isJiraConnectOpen, setIsJiraConnectOpen] = useState<boolean>(false);
	const [isLinearConnectOpen, setIsLinearConnectOpen] = useState<boolean>(
		false,
	);
	const [isAsanaConnectOpen, setIsAsanaConnectOpen] = useState<boolean>(false);

	const {
		commentsState,
		resolveCommentThread,
		unresolveCommentThread,
		deleteCommentThread,
		addResolvedCommentThread,
		removeResolvedCommentThread,
	} = useComments(commentsContext);
	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	const firstComment = commentThread.comments[0];
	const lastComment = commentThread.comments.at(-1);

	if (firstComment === undefined || lastComment === undefined) {
		logger.debug('Missing comments in comment thread');
		return null;
	}

	const firstCommentUser = firstComment.authorUser;
	const lastCommentUser = lastComment.authorUser;

	if (firstCommentUser === null || lastCommentUser === null) {
		logger.debug('Missing comment thread author');
		return null;
	}

	const { project } = commentThread;
	const { organization } = project;
	const { linkedProjectLivePreview } = commentThread;

	const projectUrl = ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
		path: `/${organization.slug}/projects/${project.slug}`,
	});

	const resolveThreadAction = async () => {
		const result = await resolveCommentThread.server(
			(state) => {
				state = addResolvedCommentThread.action({
					commentThreadId: commentThread._id,
				})(state);
				return resolveCommentThread.action({
					commentThreadId: commentThread._id,
					resolvedByUserId: commentsState.actorUserId,
				})(state);
			},
			{ commentThreadId: commentThread._id },
		);

		if (result.isErr()) {
			toast.procedureError(result);
		}
	};

	return (
		<>
			<div
				className={cn(
					'w-full max-w-3xl flex flex-row justify-center items-start gap-x-4 pt-5',
					commentThread.resolvedByUser !== null ? 'opacity-50' : '',
				)}
			>
				<div className="flex flex-col justify-start items-center ">
					<UserAvatar
						size="lg"
						profileImageUrl={firstCommentUser.profileImageUrl}
						name={firstCommentUser.fullName}
					/>
				</div>
				<div
					className={cn(
						'flex flex-col justify-center items-center w-full border-solid border-b border-b-border pb-5',
						commentThread.resolvedByUser !== null ? 'grayscale' : '',
					)}
				>
					<div className="flex flex-row justify-between items-center w-full gap-2">
						<p className="font-normal text-foreground line-clamp-1">
							{firstCommentUser.fullName}
							{showProject && (
								<>
									{' '}
									<span className="text-muted-foreground">in</span>{' '}
									<a href={projectUrl} onClick={(e) => e.preventDefault()}>
										{project.name}
									</a>
								</>
							)}
						</p>

						<div className="flex flex-row justify-center items-center h-full gap-2">
							{commentThread.resolvedByUser !== null && (
								<Badge size="md" className="gap-x-2">
									<div className="bg-brand-green h-2 w-2 rounded-full" />
									Resolved
								</Badge>
							)}
							<p className="text-sm font-light text-muted-foreground min-w-max">
								{dayjs(firstComment._creationTime).fromNow()}
							</p>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										size="xs"
										variant="ghost"
										data-testid="comment-more-button"
									>
										<MoreHorizontal size={14} className="text-foreground" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									container={commentsState.container}
									align="end"
									style={{
										zIndex: 1000,
									}}
								>
									{commentThread.resolvedByUser !== null ?
										(
											<DropdownMenuItem
												onClick={async () => {
													const result = await unresolveCommentThread.server(
														(state) => {
															state = removeResolvedCommentThread.action({
																commentThreadId: commentThread._id,
															})(state);
															return unresolveCommentThread.action({
																commentThreadId: commentThread._id,
															})(state);
														},
														{ commentThreadId: commentThread._id },
													);

													if (result.isErr()) {
														toast.procedureError(result);
													}
												}}
											>
												<ThumbsDown size={16} />
												Unresolve
											</DropdownMenuItem>
										) :
										(
											<DropdownMenuItem
												onClick={async () => {
													if (
														actorOrganizationMember &&
														actorOrganizationMember.linkedJiraAccount ===
															null &&
														commentThread.jiraIssueRelation !== null
													) {
														setIsJiraConnectOpen(true);
													} else if (
														actorOrganizationMember &&
														actorOrganizationMember.linkedLinearAccount ===
															null &&
														commentThread.linearIssueRelation !== null
													) {
														setIsLinearConnectOpen(true);
													} else if (
														actorOrganizationMember &&
														actorOrganizationMember.linkedAsanaAccount ===
															null &&
														commentThread.asanaTaskRelation !== null
													) {
														setIsAsanaConnectOpen(true);
													} else {
														await resolveThreadAction();
													}
												}}
											>
												<ThumbsUp size={16} />
												Resolve thread
											</DropdownMenuItem>
										)}

									{commentThread.resolvedByUser === null &&
										commentsState.focusedCommentThreadId !==
											commentThread._id &&
										linkedProjectLivePreview !== null &&
										(
											<DropdownMenuItem
												onClick={() => {
													const { route } = commentThread;

													if (window.location.pathname === route) {
														pageInjectionContext.store.setState({
															isInboxOpen: false,
															focusedCommentThreadId: commentThread._id,
														});
													} else {
														window.location.href =
															getReleaseProjectLivePreviewUrl(
																{
																	hostname: linkedProjectLivePreview.url,
																	path:
																		`${route}#tunnel_comment=${commentThread._id}`,
																	withScheme: true,
																},
															);
													}
												}}
											>
												<Eye size={16} /> View Comment
											</DropdownMenuItem>
										)}

									{(firstCommentUser._id ===
											commentsState.userActor.data.id) ||
											(actorOrganizationMember &&
												(actorOrganizationMember.role !== 'member')) ?
										(
											<DropdownMenuItem
												onClick={async () => {
													const result = await deleteCommentThread.server(
														deleteCommentThread.action({
															commentThreadId: commentThread._id,
														}),
														{ commentThreadId: commentThread._id },
													);

													if (result.isErr()) {
														toast.procedureError(result);
													}
												}}
												danger
											>
												<Trash2 size={16} />
												Delete
											</DropdownMenuItem>
										) :
										null}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="flex flex-col justify-center items-center w-full gap-y-4 mt-1">
						<div className="text-left w-full">
							<ReadTiptapEditor
								commentsContext={commentsContext}
								className={cn(
									'text-left text-secondary-foreground font-light',
								)}
								content={firstComment.content}
							/>
						</div>
						{(firstComment.files.length > 0 ||
							commentThread.sessionEventsFile !== null) && (
							<div className="flex flex-row justify-start w-full gap-3 flex-wrap">
								{commentThread.sessionEventsFile !== null && (
									<RrwebPlayerPreviewFromFileDoc
										sessionEventsFile={commentThread.sessionEventsFile}
										sessionEventsThumbnailFile={commentThread
											.sessionEventsThumbnailFile}
										size="md"
										container={commentsContext.commentsState.container}
									/>
								)}
								{firstComment.files.map((file, i) => (
									<div
										key={i}
										className="flex justify-center items-center relative"
									>
										<div className="w-36 border border-solid border-border rounded-[5px] overflow-hidden bg-background">
											<AspectRatio
												ratio={16 / 9}
												className="flex flex-col justify-center items-center"
											>
												<ExpandableImage
													commentsContext={commentsContext}
													src={getFileUrl(file)}
													type={file.type}
													className="object-cover"
												/>
											</AspectRatio>
										</div>
										<div className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-secondary border border-solid border-border flex justify-center items-center text-[10px] text-medium text-muted-foreground">
											<div className="flex">{i + 1}</div>
										</div>
									</div>
								))}
							</div>
						)}
						<div className="flex flex-row justify-start flex-wrap items-center w-full gap-1">
							<Button
								onClick={onExpand}
								variant="outline"
								size="sm"
								// className="h-8 flex flex-row justify-center items-center px-2 border-border border border-solid rounded-[5px] gap-1.5 hover:bg-secondary transition-all"
							>
								{commentThread.comments.length - 1 > 0 ?
									(
										<>
											<UserAvatar
												size="xs"
												profileImageUrl={lastCommentUser.profileImageUrl}
												name={lastCommentUser.fullName}
											/>
											<p className="text-[12px] font-medium">
												{commentThread.comments.length - 1}{' '}
												{commentThread.comments.length - 1 > 1 ?
													'replies' :
													'reply'}
											</p>
										</>
									) :
									<MessageCircle size={14} />}
							</Button>
							{(commentThread.consoleLogsFile !== null ||
								commentThread.windowMetadata_ !== null ||
								commentThread.gitMetadata_ !== null) && (
								<EnvironmentDialogButton
									commentThread={commentThread}
									commentsContext={commentsContext}
									size="md"
								/>
							)}
							{commentThread.jiraIssueRelation !== null && (
								<a
									href={commentThread.jiraIssueRelation.projectJiraIssue
										.url}
									target="_blank"
								>
									<Badge size="md" className="gap-x-2">
										<JiraIcon variant="rounded" size="xs" />
										{commentThread.jiraIssueRelation.projectJiraIssue.key}
									</Badge>
								</a>
							)}
							{commentThread.linearIssueRelation !== null && (
								<a
									href={commentThread.linearIssueRelation.projectLinearIssue
										.issueUrl}
									target="_blank"
								>
									<Badge size="md" className="gap-x-2">
										<LinearIcon variant="rounded" size="xs" />
										{commentThread.linearIssueRelation.projectLinearIssue
											.identifier}
									</Badge>
								</a>
							)}
							{commentThread.slackMessageRelation !== null && (
								<a
									href={commentThread.slackMessageRelation
										.projectSlackMessage
										.permalink}
									target="_blank"
								>
									<Badge size="md" className="gap-x-2">
										<SlackIcon variant="rounded" size="xs" />
										#{commentThread.slackMessageRelation.projectSlackMessage
											.channelName}
									</Badge>
								</a>
							)}
							{commentThread.asanaTaskRelation !== null && (
								<a
									href={commentThread.asanaTaskRelation.projectAsanaTask.url}
									target="_blank"
								>
									<Badge size="md" className="gap-x-2">
										<AsanaIcon variant="rounded" size="xs" />
										{commentThread.asanaTaskRelation.projectAsanaTask.gid}
									</Badge>
								</a>
							)}
						</div>
					</div>
				</div>
			</div>

			{actorOrganizationMember && (
				<JiraConnectDialog
					open={isJiraConnectOpen}
					onOpenChange={setIsJiraConnectOpen}
					organizationMemberId={actorOrganizationMember._id}
					container={commentsState.container}
					onSkip={async () => {
						await resolveThreadAction();
					}}
				/>
			)}
			{actorOrganizationMember && (
				<LinearConnectDialog
					open={isLinearConnectOpen}
					onOpenChange={setIsLinearConnectOpen}
					organizationMemberId={actorOrganizationMember._id}
					container={commentsState.container}
					onSkip={async () => {
						await resolveThreadAction();
					}}
				/>
			)}
			{actorOrganizationMember && (
				<AsanaConnectDialog
					open={isAsanaConnectOpen}
					onOpenChange={setIsAsanaConnectOpen}
					organizationMemberId={actorOrganizationMember._id}
					container={commentsState.container}
					onSkip={async () => {
						await resolveThreadAction();
					}}
				/>
			)}
		</>
	);
}
