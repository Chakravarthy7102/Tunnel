import { ExpandableImage } from '#components/expandable-image.tsx';
import { ReadTiptapEditor } from '#components/tiptap/editor.tsx';
import { useComments } from '#hooks/comments.ts';
import type { CommentsContext } from '#types';
import { type ClientDoc, select } from '@-/client-doc';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$actorProfileData,
	type ProjectComment_$commentsProviderData,
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
import { getFileUrl } from '@-/file';
import {
	AsanaConnectDialog,
	JiraConnectDialog,
	LinearConnectDialog,
} from '@-/integrations/components';
import { RrwebPlayerPreviewFromFileDoc } from '@-/rrweb-player';
import { toast } from '@-/tunnel-error';
import { UserAvatar } from '@-/user/components';
import { dayjs } from '@tunnel/dayjs';
import { MoreHorizontal, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NavigationButton } from './navigation-button.tsx';

export function FirstComment({
	commentsContext,
	commentThread,
	comment,
	activeSection,
	setActiveSection,
}: {
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
	comment: ClientDoc<typeof ProjectComment_$commentsProviderData>;
	activeSection: string;
	setActiveSection: (
		section: 'feed' | 'console' | 'metadata' | 'network',
	) => void;
}) {
	const {
		commentsState,
		deleteCommentThread,
		unresolveCommentThread,
		resolveCommentThread,
		setFocusedCommentThread,
		setActiveCommentThread,
		addResolvedCommentThread,
	} = useComments(commentsContext);

	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	const [isJiraConnectOpen, setIsJiraConnectOpen] = useState<boolean>(false);
	const [isLinearConnectOpen, setIsLinearConnectOpen] = useState<boolean>(
		false,
	);
	const [isAsanaConnectOpen, setIsAsanaConnectOpen] = useState<boolean>(false);

	if (comment.authorUser === null) {
		return null;
	}

	const user = comment.authorUser;

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
			<div className="flex flex-col justify-center items-center w-full max-w-3xl border-b border-solid border-b-border">
				<div className="flex flex-row justify-between items-center w-full">
					<div className="flex flex-row justify-center items-center gap-3">
						<UserAvatar
							size="lg"
							profileImageUrl={user.profileImageUrl}
							name={user.fullName}
						/>
						<p className="font-normal">{user.fullName}</p>
					</div>
					<div className="flex flex-row justify-center items-center h-full gap-2">
						{commentThread.resolvedByUser !== null && (
							<Badge size="md" className="gap-x-2">
								<div className="bg-brand-green h-2 w-2 rounded-full" />
								Resolved
							</Badge>
						)}
						<p className="text-sm font-light text-muted-foreground min-w-max">
							{dayjs(comment._creationTime).fromNow()}
						</p>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									size="xs"
									variant="ghost"
									data-testid="comment-more-button"
								>
									<MoreHorizontal size={14} />
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
												const commentThreadId = comment.parentCommentThread._id;
												const result = await unresolveCommentThread.server(
													unresolveCommentThread.action({ commentThreadId }),
													{ commentThreadId },
												);

												if (result.isErr()) {
													toast.procedureError(result);
												}
											}}
										>
											<ThumbsDown size={16} />
											Unresolve Thread
										</DropdownMenuItem>
									) :
									(
										<DropdownMenuItem
											onClick={async () => {
												if (
													actorOrganizationMember &&
													actorOrganizationMember.linkedJiraAccount === null &&
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
													actorOrganizationMember.linkedAsanaAccount === null &&
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

								{(user._id === commentsState.userActor.data.id) ||
										(actorOrganizationMember &&
											(actorOrganizationMember.role !== 'member')) ?
									(
										<DropdownMenuItem
											onClick={async () => {
												const result = await deleteCommentThread.server(
													(state) => {
														state = setFocusedCommentThread.action({
															commentThreadId: null,
														})(state);
														state = setActiveCommentThread.action({
															commentThreadId: null,
														})(state);
														state = deleteCommentThread.action({
															commentThreadId: comment.parentCommentThread._id,
														})(state);
														return state;
													},
													{ commentThreadId: comment.parentCommentThread._id },
												);

												if (result.isErr()) {
													toast.procedureError(result);
												} else {
													toast.success('Successfully deleted comment');
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
					{
						<ReadTiptapEditor
							commentsContext={commentsContext}
							className={cn('font-light text-left w-full')}
							content={comment.content}
						/>
					}

					{(comment.files.length > 0 ||
						commentThread.sessionEventsFile !== null) && (
						<div className="flex flex-row justify-start items-center gap-x-1 w-full">
							{commentThread.sessionEventsFile && (
								<RrwebPlayerPreviewFromFileDoc
									sessionEventsFile={commentThread.sessionEventsFile}
									sessionEventsThumbnailFile={commentThread
										.sessionEventsThumbnailFile}
									container={commentsState.container}
									size="lg"
								/>
							)}
							{comment.files.map((file, i) => (
								<div
									key={clientId(file._id)}
									className="flex justify-center items-center relative"
								>
									<div className="w-[240px] border border-solid border-border rounded-[5px] overflow-hidden bg-background">
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

					<div className="flex flex-row justify-start flex-wrap items-center w-full gap-1 py-1">
						<NavigationButton
							isActive={activeSection === 'feed'}
							onClick={() => {
								setActiveSection('feed');
							}}
						>
							Feed
						</NavigationButton>
						<NavigationButton
							isActive={activeSection === 'console'}
							onClick={() => {
								setActiveSection('console');
							}}
						>
							Console
						</NavigationButton>
						<NavigationButton
							isActive={activeSection === 'network'}
							onClick={() => {
								setActiveSection('network');
							}}
						>
							Network
						</NavigationButton>
						<NavigationButton
							isActive={activeSection === 'metadata'}
							onClick={() => {
								setActiveSection('metadata');
							}}
						>
							Metadata
						</NavigationButton>
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
