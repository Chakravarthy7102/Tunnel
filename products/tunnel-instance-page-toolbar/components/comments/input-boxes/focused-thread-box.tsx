import { ToolbarComment } from '#components/comments/toolbar-comment.tsx';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { type ClientDoc, select } from '@-/client-doc';
import {
	ToolbarReplyInput,
	useComments,
} from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	Project_$commentsProviderData,
	type ProjectCommentThread_$commentsProviderData,
	type ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import {
	Button,
	Tooltip,
	TooltipContent,
	TooltipPortal,
	TooltipTrigger,
} from '@-/design-system/v1';
import {
	AsanaConnectDialog,
	JiraConnectDialog,
	LinearConnectDialog,
} from '@-/integrations/components';
import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Calculate the top position for the comment box to ensure it stays within the viewport.
 * @param y - The Y coordinate where the box is intended to be displayed.
 * @param containerHeight - The height of the container.
 * @returns {number} - The calculated top position.
 */
function calculateTopPosition(y: number, containerHeight: number): number {
	let top = y;

	if (y + containerHeight > window.innerHeight) {
		top = window.innerHeight - containerHeight;
	}

	if (y < 0) {
		top = 0;
	}

	return top;
}

export function FocusedThreadBox({
	context,
	commentThread,
	x,
	y,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		isOnline: true;
		actorType: 'User';
	}>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$tunnelInstancePageToolbarData
	>;
	x: number;
	y: number;
}) {
	const state = useContextStore(context);
	const commentsContext = useCommentsContext({ context });
	const { setFocusedCommentThread } = useComments(commentsContext);

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

	const editor = useFullEditor({
		commentsContext,
		organization,
	});

	const containerRef = useRef<HTMLDivElement>(null);
	const [containerHeight, setContainerHeight] = useState(0);

	const [isFocused, setIsFocused] = useState(
		commentThread._id === state.focusedCommentThreadId,
	);

	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setContainerHeight(entry.contentRect.height);
				}
			});

			resizeObserver.observe(container);

			return () => {
				resizeObserver.unobserve(container);
			};
		}
	}, []);

	useEffect(() => {
		if (commentThread._id === state.focusedCommentThreadId) {
			editor?.commands.focus();
			setIsFocused(true);
		} else if (isFocused) {
			setTimeout(() => {
				setIsFocused(false);
			}, 300);
		}
	}, [commentThread._id, state.focusedCommentThreadId]);

	const firstComment = commentThread.comments[0];
	if (firstComment === undefined) {
		return null;
	}

	return (
		<>
			<div
				ref={containerRef}
				style={commentThread._id === state.focusedCommentThreadId ?
					{
						zIndex: 998,
						top: calculateTopPosition(y, containerHeight),
						left: x > window.innerWidth / 2 ?
							x - 320 - 24 :
							x + 72,
						opacity: 1,
						transform: 'translateY(0px)',
						transition: 'transform ease 200ms, opacity ease 200ms',
					} :
					{
						zIndex: 0,
						top: calculateTopPosition(y, containerHeight),
						left: x > window.innerWidth / 2 ?
							x - 320 - 24 :
							x + 72,
						opacity: 0,
						transform: 'translateY(10px)',
						pointerEvents: 'none',
						transition: 'transform ease 200ms, opacity ease 200ms',
					}}
				className="fixed flex-col justify-start items-stretch bg-neutral-700 rounded-md shadow-comment-shadow-primary w-80 text-main-900 overflow-hidden"
			>
				<div className="flex flex-col justify-center items-center flex-1">
					<div className="h-10 px-3 w-full bg-neutral-600 border-b border-solid border-[#ffffff10] justify-end flex items-center">
						<Button
							variant="muratsecondary"
							fill={'ghost'}
							className="h-6 w-6 flex justify-center items-center p-0 text-neutral-400 hover:text-neutral-0"
							onClick={() => {
								context.store.setState((state) => {
									state = setFocusedCommentThread.action({
										commentThreadId: null,
									})(state);
									return {
										...state,
										isCommentCursorVisible: false,
										pendingNewReply: null,
										commandModePoint: null,
										commentBoxPosition: null,
									};
								});
							}}
						>
							<X size={16} />
						</Button>
						<ResolveThreadButton
							commentThread={commentThread}
							context={context}
						/>
					</div>
					{commentThread.comments.length - 1 > 0 && (
						<div className="h-7 px-4 w-full bg-neutral-600 border-b border-solid border-[#ffffff10] flex flex-row justify-start items-center text-soft-400 text-sm font-medium">
							{commentThread.comments.length - 1}{' '}
							{commentThread.comments.length - 1 > 1 ? 'REPLIES' : 'REPLY'}
						</div>
					)}
					{isFocused && (
						<ToolbarComment
							context={context}
							comment={firstComment}
							commentThread={commentThread}
						/>
					)}
				</div>

				<div className="flex flex-col-reverse justify-start items-center w-full overflow-y-auto max-h-[50vh]">
					{editor !== null && isFocused && (
						<ToolbarReplyInput
							commentsContext={commentsContext}
							commentThread={commentThread}
							editor={editor}
						/>
					)}
					{isFocused &&
						commentThread
							.comments
							.slice(1)
							.reverse()
							.map((comment) => (
								<ToolbarComment
									key={clientId(comment._id)}
									context={context}
									comment={comment}
									commentThread={commentThread}
									isReply
								/>
							))}
				</div>
			</div>
			{commentThread._id === state.focusedCommentThreadId && (
				<div
					className="w-screen h-screen fixed inset-0"
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
								isCommentCursorVisible: false,
								pendingNewReply: null,
								commandModePoint: null,
								commentBoxPosition: null,
							};
						});
					}}
				>
				</div>
			)}
		</>
	);
}

export function ResolveThreadButton({
	context,
	commentThread,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>;
}) {
	const [isJiraConnectOpen, setIsJiraConnectOpen] = useState<boolean>(false);
	const [isLinearConnectOpen, setIsLinearConnectOpen] = useState<boolean>(
		false,
	);
	const [isAsanaConnectOpen, setIsAsanaConnectOpen] = useState<boolean>(false);

	const commentsContext = useCommentsContext({ context });
	const {
		resolveCommentThread,
		setFocusedCommentThread,
		addResolvedCommentThread,
		commentsState,
	} = useComments(commentsContext);
	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	const shadowRoot = useShadowRootElement();

	const resolveThreadAction = async () => {
		(await resolveCommentThread.server((state) => {
			state = setFocusedCommentThread.action({
				commentThreadId: null,
			})(state);
			state = addResolvedCommentThread.action({
				commentThreadId: commentThread._id,
			})(
				state,
			);
			state = resolveCommentThread.action({
				commentThreadId: commentThread._id,
				resolvedByUserId: commentsState.actorUserId,
			})(state);
			return {
				...state,
				pendingNewReply: null,
			};
		}, {
			commentThreadId: commentThread._id,
		})).unwrapOrThrow();
	};

	return (
		<>
			<Tooltip delayDuration={200}>
				<TooltipTrigger asChild>
					<Button
						variant="muratsecondary"
						fill={'ghost'}
						className="h-6 w-6 flex justify-center items-center p-0 text-neutral-400 hover:text-neutral-0"
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
						<CheckCircle2 size={16} />
					</Button>
				</TooltipTrigger>
				<TooltipPortal container={shadowRoot}>
					<TooltipContent
						className="text-sm font-medium relative"
						style={{
							zIndex: 999_999_999,
						}}
					>
						Resolve
					</TooltipContent>
				</TooltipPortal>
			</Tooltip>
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
			{actorOrganizationMember !== null && (
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
