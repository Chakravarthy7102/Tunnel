import { CommentAvatar } from '#components/comments/comment-avatar.tsx';
import { useCommentThreadAbsolutePositions } from '#hooks/comment-position.ts';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { zIndex } from '#utils/z-index.ts';
import { type ClientDoc, select } from '@-/client-doc';
import { useComments } from '@-/comments';
import { ReadTiptapEditor } from '@-/comments/tiptap';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { cn } from '@-/design-system/v1';
import { dayjs } from '@tunnel/dayjs';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

export function CommentIcons({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	const [pathname, setPathname] = useState(window.location.pathname);

	useEffect(() => {
		const checkPathname = () => {
			const currentPathname = window.location.pathname;
			if (currentPathname !== pathname) {
				setPathname(currentPathname);
			}
		};

		const intervalId = setInterval(checkPathname, 500);

		return () => clearInterval(intervalId);
	}, [pathname]);

	const { getCommentThreadAbsolutePosition } =
		useCommentThreadAbsolutePositions({
			context,
			isScrollAware: true,
		});

	const commentThreads = state.commentThreadIds.map((commentThreadId) =>
		select(
			state,
			'ProjectCommentThread',
			commentThreadId,
			getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
		)
	);

	return (
		<>
			{commentThreads.map((commentThread) => {
				if (
					(commentThread.resolvedByUser !== null ||
						commentThread.route !== pathname) &&
					!state.currentResolvedCommentThreadIds
						.includes(commentThread._id)
				) {
					return null;
				}

				const absolutePosition = getCommentThreadAbsolutePosition({
					commentThreadId: commentThread._id,
				});

				if (absolutePosition === null) {
					return null;
				}

				const firstComment = commentThread.comments[0];
				if (firstComment === undefined) {
					return null;
				}

				if (firstComment.authorUser === null) {
					return null;
				}

				return (
					<CommentIcon
						key={clientId(commentThread._id)}
						context={context}
						commentThread={commentThread}
						x={absolutePosition.x}
						y={absolutePosition.y}
						numReplies={commentThread.comments.length}
						authorUser={firstComment.authorUser}
					/>
				);
			})}
		</>
	);
}

export function CommentIcon({
	context,
	commentThread,
	x,
	y,
	// numReplies,
	authorUser,
}: {
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$tunnelInstancePageToolbarData
	>;
	x: number;
	y: number;
	numReplies: number;
	authorUser: ClientDoc<'User'>;
}) {
	const state = useContextStore(context);
	const commentThreadElementRef = useRef<HTMLButtonElement | null>(null);
	const commentsContext = useCommentsContext({ context });
	const {
		setFocusedCommentThread,
		removeResolvedCommentThread,
		unresolveCommentThread,
	} = useComments(commentsContext);
	// const [isHovered, setIsHovered] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const canHover = useRef<boolean>(true);

	const commentThreadElementCallbackRef = useCallback(
		(commentElement: HTMLButtonElement | null) => {
			if (commentElement === null) {
				return;
			}

			const hashParams = new URLSearchParams(window.location.hash.slice(1));
			const hashCommentThreadId = hashParams.get('tunnel_comment');

			if (hashCommentThreadId === null) {
				return;
			}

			if (
				hashCommentThreadId === commentThread._id
			) {
				commentElement.scrollIntoView({ behavior: 'smooth' });
				context.store.setState(
					setFocusedCommentThread.action({
						commentThreadId: commentThread._id,
					}),
				);
			}

			hashParams.delete('tunnel_comment');
			window.location.hash = hashParams.toString() || '';

			commentThreadElementRef.current = commentElement;
		},
		[],
	);

	const opacityAnimateControls = useAnimationControls();
	const currentAnimation = useRef<Promise<unknown> | null>(null);
	useEffect(() => {
		if (
			commentThread.resolvedByUser !== null
		) {
			if (currentAnimation.current === null) {
				currentAnimation.current = opacityAnimateControls.start({
					opacity: [1, 0.8, 0.8, 0],
					transition: {
						times: [0, 0.3 / 2, 1.7 / 2, 1],
						duration: 2,
						ease: 'easeOut',
					},
				});
			}
		} else {
			currentAnimation.current = null;
			opacityAnimateControls.stop();
			opacityAnimateControls.set({
				opacity: 1,
			});
		}
	}, [commentThread.resolvedByUser]);

	const _authors = [
		...new Set(commentThread.comments.map((comment) => comment.authorUser)),
	];

	const firstComment = commentThread.comments[0];

	if (!firstComment) return null;

	return (
		// <motion.button
		// 	ref={commentThreadElementCallbackRef}
		// 	whileHover="hover"
		// 	onHoverStart={() => {
		// 		setIsHovered(true);
		// 	}}
		// 	onHoverEnd={() => {
		// 		setIsHovered(false);
		// 	}}
		// 	onClick={async () => {
		// 		if (
		// 			state.currentResolvedCommentThreadIds.includes(commentThread._id)
		// 		) {
		// 			(await unresolveCommentThread.server(
		// 				(state) => {
		// 					state = removeResolvedCommentThread.action({
		// 						commentThreadId: commentThread._id,
		// 					})(state);
		// 					return unresolveCommentThread.action({
		// 						commentThreadId: commentThread._id,
		// 					})(state);
		// 				},
		// 				{ commentThreadId: commentThread._id },
		// 			)).unwrapOrThrow();
		// 		} else {
		// 			if (state.focusedCommentThreadId === commentThread._id) {
		// 				context.store.setState(
		// 					setFocusedCommentThread.action({ commentThreadId: null }),
		// 				);
		// 			} else {
		// 				context.store.setState(
		// 					setFocusedCommentThread.action({
		// 						commentThreadId: commentThread._id,
		// 					}),
		// 				);
		// 			}
		// 		}
		// 	}}
		// 	className={'flex flex-row absolute justify-center items-center group'}
		// 	animate={opacityAnimateControls}
		// 	style={{
		// 		transform: `translate(${x}px, ${y}px)`,
		// 		top: 0,
		// 		left: 0,
		// 		zIndex: zIndex.commentIcon + 1,
		// 	}}
		// >
		// 	<div
		// 		style={{
		// 			zIndex: zIndex.commentIcon,
		// 			filter: 'drop-shadow(2px 2px 2px rgb(0 0 0 / 0.4))',
		// 		}}
		// 		className={`h-7 w-7 min-h-7 min-w-[28px] bg-[#666666] text-white flex items-center justify-center shadow-md rounded-b-full rounded-r-full outline outline-[1.5px] outline-white outline-solid border border-solid border-[#333] relative ${
		// 			commentThread.resolvedByUser === null ?
		// 				'group-hover:border-white group-hover:outline-black' :
		// 				''
		// 		}`}
		// 	>
		// 		{commentThread.resolvedByUser !== null && (
		// 			<svg
		// 				xmlns="http://www.w3.org/2000/svg"
		// 				fill="none"
		// 				viewBox="0 0 28 28"
		// 				strokeWidth="1.5px"
		// 				stroke="#16cb35"
		// 				className="absolute -inset-[2.5px]"
		// 				style={{ zIndex: zIndex.commentIcon + 1 }}
		// 			>
		// 				<motion.path
		// 					initial={{ pathLength: 0 }}
		// 					animate={{ pathLength: 1 }}
		// 					transition={{
		// 						type: 'tween',
		// 						duration: 1.5,
		// 						ease: 'linear',
		// 						delay: 0.2,
		// 					}}
		// 					strokeLinecap="butt"
		// 					strokeLinejoin="miter"
		// 					d="
		// 						M 0,0.75
		// 						L 13.25,0.75
		// 						A 13.25 13.25 0 0 1 27.25,13.25
		// 						A 13.25 13.25 0 0 1 13.25,27.25
		// 						A 13.25 13.25 0 0 1 0.75,13.25
		// 						L 0.75,0
		// 					"
		// 				/>
		// 			</svg>
		// 		)}
		// 		{commentThread.resolvedByUser === null ?
		// 			(
		// 				<p className="font-bold text-xs">
		// 					{numReplies < 10 ? numReplies : '9+'}
		// 				</p>
		// 			) :
		// 			isHovered ?
		// 			<UndoIcon size={12} /> :
		// 			<CheckIcon size={12} />}
		// 	</div>

		// 	<CommentAvatar context={context} user={authorUser} />
		// </motion.button>

		<motion.button
			ref={commentThreadElementCallbackRef}
			whileHover="hover"
			onHoverStart={() => {
				if (canHover.current) {
					setIsOpen(true);
				}
			}}
			onHoverEnd={() => {
				setIsOpen(false);
				canHover.current = false;
				setTimeout(() => {
					canHover.current = true;
				}, 200);
			}}
			onClick={async () => {
				setIsOpen(false);
				canHover.current = false;
				if (
					state.currentResolvedCommentThreadIds.includes(commentThread._id)
				) {
					(await unresolveCommentThread.server(
						(state) => {
							state = removeResolvedCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
							return unresolveCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
						},
						{ commentThreadId: commentThread._id },
					)).unwrapOrThrow();
				} else {
					if (state.focusedCommentThreadId === commentThread._id) {
						context.store.setState(
							setFocusedCommentThread.action({ commentThreadId: null }),
						);
					} else {
						context.store.setState(
							setFocusedCommentThread.action({
								commentThreadId: commentThread._id,
							}),
						);
					}
				}
			}}
			className={cn(
				'flex flex-row gap-x-2 justify-start items-start bg-neutral-600 border border-solid border-[#ffffff10] absolute rounded-2xl rounded-tl-none hover:bg-neutral-700 transition-colors group overflow-hidden',
				isOpen ?
					'shadow-comment-shadow-primary p-2' :
					'shadow-button-focus-important p-1',
				canHover.current ? 'cursor:pointer' : 'cursor-default',
			)}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				top: 0,
				left: 0,
				zIndex: zIndex.commentIcon + 1,
				transition:
					'width 0.2s ease-in-out, height 0.2s ease-in-out, border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background 0.2s ease-in-out, background-color 0.2s ease-in-out, padding 0.2s ease-in-out',
			}}
		>
			<motion.div className="flex flex-row justify-center items-center min-w-max">
				<CommentAvatar
					context={context}
					user={authorUser}
					className={'-ml-1 first:ml-0 border-[2px] border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors'}
				/>
			</motion.div>

			{
				/* <div
				className="-ml-2 h-6 w-6 rounded-full bg-yellow-500 border-[2px] border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-green-500 border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-neutral-400 border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors text-neutral-0 font-medium text-[10px] flex justify-center items-center py-1"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			>
				+2
			</div> */
			}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{
							opacity: 0,
							height: 0,
							width: 0,
						}}
						className="flex flex-col justify-start items-start min-w-[198px]"
					>
						<div className="flex flex-row justify-center items-center gap-x-1.5">
							<p className="text-main-900 text-sm font-medium text-left line-clamp-1 min-w-max">
								{authorUser.fullName}
							</p>
							<p className="text-soft-400 text-sm font-normal text-left line-clamp-1 min-w-max">
								{dayjs(firstComment._creationTime).fromNow()}
							</p>
						</div>
						<div className="">
							<ReadTiptapEditor
								commentsContext={commentsContext}
								className={cn(
									'text-main-900 text-sm font-normal text-left line-clamp-3 ',
								)}
								content={firstComment.content}
							/>
						</div>
						{commentThread.comments.length > 1 && (
							<div className="mt-2 text-soft-400 text-sm font-normal text-left">
								{commentThread.comments.length - 1}{' '}
								{commentThread.comments.length === 2 ? 'Reply' : 'Replies'}
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.button>
	);
}

/* new unread icon
 <motion.button
			ref={commentThreadElementCallbackRef}
			whileHover="hover"
			onHoverStart={() => {
				setIsHovered(true);
			}}
			onHoverEnd={() => {
				setIsHovered(false);
			}}
			onClick={async () => {
				if (
					state.currentResolvedCommentThreadIds.includes(commentThread._id)
				) {
					(await unresolveCommentThread.server(
						(state) => {
							state = removeResolvedCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
							return unresolveCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
						},
						{ commentThreadId: commentThread._id },
					)).unwrapOrThrow();
				} else {
					if (state.focusedCommentThreadId === commentThread._id) {
						context.store.setState(
							setFocusedCommentThread.action({ commentThreadId: null }),
						);
					} else {
						context.store.setState(
							setFocusedCommentThread.action({
								commentThreadId: commentThread._id,
							}),
						);
					}
				}
			}}
			className="h-8 p-1 flex flex-row justify-center items-center gap-x-[-2px] bg-muratblue-base border border-solid border-muratblue-lighter shadow-button-focus-blue absolute rounded-2xl rounded-bl-none hover:bg-muratblue-dark transition-colors group"
			animate={opacityAnimateControls}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				top: 0,
				left: 0,
				zIndex: zIndex.commentIcon + 1,
			}}
		>
			<CommentAvatar
				context={context}
				user={authorUser}
				className="-ml-1 first:ml-0 border-[2px] border-solid border-muratblue-base group-hover:border-muratblue-dark transition-colors"
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full bg-yellow-500 border-[2px] border-solid border-muratblue-base group-hover:border-muratblue-dark transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-green-500 border-solid border-muratblue-base group-hover:border-muratblue-dark transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-muratblue-darker border-solid border-muratblue-base group-hover:border-muratblue-dark transition-colors text-neutral-0 font-medium text-[10px] flex justify-center items-center py-1"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			>
				+2
			</div>
		</motion.button>
	);
*/

/* already read new icon
	<motion.button
			ref={commentThreadElementCallbackRef}
			whileHover="hover"
			onHoverStart={() => {
				setIsHovered(true);
			}}
			onHoverEnd={() => {
				setIsHovered(false);
			}}
			onClick={async () => {
				if (
					state.currentResolvedCommentThreadIds.includes(commentThread._id)
				) {
					(await unresolveCommentThread.server(
						(state) => {
							state = removeResolvedCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
							return unresolveCommentThread.action({
								commentThreadId: commentThread._id,
							})(state);
						},
						{ commentThreadId: commentThread._id },
					)).unwrapOrThrow();
				} else {
					if (state.focusedCommentThreadId === commentThread._id) {
						context.store.setState(
							setFocusedCommentThread.action({ commentThreadId: null }),
						);
					} else {
						context.store.setState(
							setFocusedCommentThread.action({
								commentThreadId: commentThread._id,
							}),
						);
					}
				}
			}}
			className="h-8 p-1 flex flex-row justify-center items-center bg-neutral-600 border border-solid border-[#ffffff10] shadow-button-focus-important absolute rounded-2xl rounded-bl-none hover:bg-neutral-700 transition-colors group"
			animate={opacityAnimateControls}
			style={{
				transform: `translate(${x}px, ${y}px)`,
				top: 0,
				left: 0,
				zIndex: zIndex.commentIcon + 1,
			}}
		>
			<CommentAvatar
				context={context}
				user={authorUser}
				className="-ml-1 first:ml-0 border-[2px] border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors"
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full bg-yellow-500 border-[2px] border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-green-500 border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			/>
			<div
				className="-ml-2 h-6 w-6 rounded-full border-[2px] bg-neutral-400 border-solid border-neutral-600 group-hover:border-neutral-700 transition-colors text-neutral-0 font-medium text-[10px] flex justify-center items-center py-1"
				style={{ zIndex: zIndex.commentIconAvatar + 1 }}
			>
				+2
			</div>
		</motion.button>

*/
