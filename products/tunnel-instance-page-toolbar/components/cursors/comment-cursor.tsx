import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useOnceEffect } from '#utils/effect.ts';
import { zIndex } from '#utils/z-index.ts';
import { motion, useTransform } from 'framer-motion';
import { Plus } from 'lucide-react';

function useEscapeKeyToExit({
	context,
}: {
	context: PageToolbarContext<{ hasProject: true; actorType: 'User' }>;
}) {
	useOnceEffect(() => {
		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				context.store.setState({
					isCommentCursorVisible: false,
					pendingNewCommentThread: null,
					commentBoxPosition: null,
				});
			}
		};

		window.addEventListener('keydown', handleEsc);

		return () => {
			window.removeEventListener('keydown', handleEsc);
		};
	});
}

export function CommentCursorPlus() {
	return (
		<div
			style={{
				zIndex: zIndex.commentCursor,
			}}
			className="flex justify-center items-center bg-muratblue-base shadow-button-focus-blue border border-solid border-muratblue-lighter h-8 w-8 rounded-full rounded-tl-none"
		>
			<Plus color="#fff" size={16} />
		</div>
	);
}

/**
	For performance, we don't pass `x` and `y` as props to avoid re-rendering the component tree.
*/
export function CommentModeCursor({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		actorType: 'User';
	}>;
}) {
	const x = useTransform(context.mousePositionMotionValue, ({ x }) => x);
	const y = useTransform(context.mousePositionMotionValue, ({ y }) => y);
	useEscapeKeyToExit({ context });

	return (
		<motion.button
			className="cursor-none fixed flex top-0 left-0 justify-center items-center"
			style={{
				translateX: x,
				translateY: y,
				zIndex: zIndex.commentCursor,
			}}
		>
			<CommentCursorPlus />
		</motion.button>
	);
}

export function CommentCursor({
	context,
	x,
	y,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		actorType: 'User';
	}>;
	x: number;
	y: number;
}) {
	const state = useContextStore(context);
	useEscapeKeyToExit({ context });

	const targetRect = state.toolbar.toolbarRef?.getBoundingClientRect();
	if (
		targetRect &&
		x >= targetRect.left &&
		x <= targetRect.right &&
		y >= targetRect.top &&
		y <= targetRect.bottom
	) {
		return null;
	}

	return (
		<div
			style={{
				transform: `translate(${x}px, ${y}px)`,
				zIndex: zIndex.commentCursor,
			}}
			className="fixed flex top-0 left-0 justify-center items-center cursor-default"
		>
			<CommentCursorPlus />
		</div>
	);
}
