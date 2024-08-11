/* eslint-disable complexity -- TODO */

import { Avatar } from '#components/avatar.tsx';
import useDayjsTime from '#hooks/dayjs-time.ts';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import type { ClientDoc } from '@-/client-doc';
import {
	type CommentsContext,
	ExpandableImage,
	ThreadBadges,
	useComments,
} from '@-/comments';
import {
	ReadTiptapEditor,
} from '@-/comments/tiptap';
import { clientId } from '@-/database';
import type {
	ProjectComment_$commentsProviderData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import {
	AspectRatio,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { getFileUrl } from '@-/file';
import { SlackIcon } from '@-/integrations/components';
import { RrwebPlayerPreviewFromFileDoc } from '@-/rrweb-player';
import { Inbox, Link, MoreHorizontal, Trash2 } from 'lucide-react';

export function ToolbarComment({
	context,
	comment,
	isReply,
	commentThread,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
	comment: ClientDoc<typeof ProjectComment_$commentsProviderData>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>;
	isReply?: boolean;
}) {
	const state = useContextStore(context);
	const commentsContext = useCommentsContext({ context });
	const {
		deleteComment,
		deleteCommentThread,
		setFocusedCommentThread,
		setActiveCommentThread,
	} = useComments(commentsContext);

	const isFirstComment = commentThread.comments[0]?._id === comment._id;
	const isFocused = commentThread._id === state.focusedCommentThreadId;

	const shadowRootElement = useShadowRootElement();

	const time = useDayjsTime(comment._creationTime);
	if (comment.authorUser === null) {
		return null;
	}

	const commentAuthorUser = comment.authorUser;
	const isBot = commentAuthorUser.username === 'tunnel-bot';

	let { fullName } = commentAuthorUser;

	if (isBot && comment.authorInformation) {
		fullName = comment.authorInformation.displayName;
	}

	return (
		<div
			className={cn(
				'flex flex-col justify-start items-start w-full border-b border-solid border-[#ffffff10] p-4 overflow-hidden',
			)}
		>
			<div className="flex flex-row justify-between items-start w-full gap-x-2">
				<div className="relative min-w-max">
					<Avatar
						context={context}
						isOutlined
						user={commentAuthorUser}
						authorInformation={comment.authorInformation ?? null}
					/>
					{comment.sentBySlack && (
						<SlackIcon size="xs" className="absolute -bottom-1 -right-1" />
					)}
				</div>
				<div className="flex flex-col justify-center items-start w-full">
					<div className="flex flex-row justify-center items-center gap-x-2">
						<p
							className={cn(
								'text-xs text-neutral-0 font-medium',
							)}
						>
							{fullName.length > 14 ?
								`${fullName.slice(0, 14)}...` :
								`${fullName}`}
						</p>
						<p className="text-xs text-neutral-400 font-normal">
							{time}
						</p>
					</div>
					<CommentContent
						isFocused={isFocused}
						commentsContext={commentsContext}
						comment={comment}
						commentThread={commentThread}
						isReply={isReply ?? false}
					/>
				</div>

				<div className="flex flex-row justify-center items-center text-muted-foreground">
					{!isBot && (
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button size="icon" variant="ghost">
									<MoreHorizontal size={16} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								container={shadowRootElement}
								align="end"
								style={{
									zIndex: 1000,
								}}
							>
								{isFirstComment && (
									<>
										<DropdownMenuItem
											onClick={async () => {
												context.store.setState({
													focusedCommentThreadId: commentThread
														._id as any,
													isInboxOpen: true,
													activeCommentThreadId: commentThread
														._id as any,
												});
											}}
										>
											<Inbox size={16} />
											Open in Inbox
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={async () => {
												await navigator.clipboard.writeText(
													`${window.location.href}#tunnel_comment=${commentThread._id}`,
												);
											}}
										>
											<Link size={16} />
											Copy Link
										</DropdownMenuItem>
									</>
								)}
								{commentAuthorUser._id === state.actor.data.id && (
									<DropdownMenuItem
										danger
										onClick={async () => {
											if (isFirstComment) {
												(await deleteCommentThread.server(
													(state) => {
														if (
															commentThread._id ===
																state.focusedCommentThreadId
														) {
															state = setFocusedCommentThread.action({
																commentThreadId: null,
															})(state);
														}

														if (
															commentThread._id ===
																state.activeCommentThreadId
														) {
															state = setActiveCommentThread.action({
																commentThreadId: null,
															})(state);
														}

														return deleteCommentThread.action(
															{ commentThreadId: commentThread._id },
														)(state);
													},
													{ commentThreadId: commentThread._id },
												)).unwrapOrThrow();
											} else {
												(await deleteComment.server(
													deleteComment.action({
														commentId: comment._id,
													}),
													{ commentId: comment._id },
												))
													.unwrapOrThrow();
											}
										}}
									>
										<Trash2 size={16} />
										Delete
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>
		</div>
	);
}

function CommentContent({
	isFocused,
	commentsContext,
	comment,
	commentThread,
	isReply,
}: {
	isFocused: boolean;
	commentsContext: CommentsContext;
	comment: ClientDoc<typeof ProjectComment_$commentsProviderData>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>;
	isReply: boolean;
}) {
	return (
		<div className="flex flex-col justify-center items-center w-full">
			<div className="flex flex-row justify-start items-start w-full">
				{isFocused &&
					(
						<ReadTiptapEditor
							commentsContext={commentsContext}
							className={cn(
								'text-left font-normal text-neutral-0 text-xs',
							)}
							content={comment.content}
						/>
					)}
			</div>

			<div
				className={cn(
					(comment.files.length > 0 ||
						(commentThread.sessionEventsFile !== null && !isReply)) && 'py-3 ',
					'flex flex-row justify-start items-center w-full overflow-x-auto gap-4',
				)}
			>
				{commentThread.sessionEventsFile !== null && !isReply && (
					<RrwebPlayerPreviewFromFileDoc
						sessionEventsFile={commentThread.sessionEventsFile}
						sessionEventsThumbnailFile={commentThread
							.sessionEventsThumbnailFile}
						container={commentsContext.commentsState.container}
						size="md"
					/>
				)}
				{comment.files.length > 0 && comment.files.map((file, i) => (
					<div
						key={clientId(file._id)}
						className="flex justify-center items-center relative"
					>
						<div className="w-36 border border-solid border-border rounded-[5px] overflow-hidden">
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
			<div className="w-full py-1">
				{!isReply && (
					<ThreadBadges
						commentThread={commentThread}
						commentsContext={commentsContext}
					/>
				)}
			</div>
		</div>
	);
}
