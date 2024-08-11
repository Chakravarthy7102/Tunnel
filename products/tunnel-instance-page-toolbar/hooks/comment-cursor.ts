import type { PageToolbarContext } from '#types';
import { useRef } from 'react';

export function useCommentCursor(_args: {
	context: PageToolbarContext<{ hasProject: true }>;
}) {
	const commentCursorRef = useRef<HTMLDivElement>(null);

	// useOnceEffect(() => {
	// 	subscribeKey(state, 'isCommentCursorVisible', () => {
	// 		if (state.isCommentCursorVisible) {
	// 			document.body.style.cursor = 'none';
	// 			context.store.setState({commentBoxPosition : null});
	// 		} else {
	// 			document.body.style.cursor = 'auto';
	// 		}
	// 	});
	// });

	// // Handle mouse leaving window while cursor is open
	// useOnceEffect(() => {
	// 	const onMouseEnter = () => {
	// 		if (
	// 			state.isCommentCursorVisible &&
	// 			state.commentBoxPosition !== null
	// 		) {
	// 			commentCursorRef.current?.classList.remove('hidden');
	// 		}
	// 	};

	// 	const onMouseLeave = () => {
	// 		if (
	// 			state.isCommentCursorVisible &&
	// 			state.commentBoxPosition === null
	// 		) {
	// 			commentCursorRef.current?.classList.add('hidden');
	// 		}
	// 	};

	// 	document.addEventListener('mouseenter', onMouseEnter);
	// 	document.addEventListener('mouseleave', onMouseLeave);

	// 	return () => {
	// 		document.removeEventListener('mouseenter', onMouseEnter);
	// 		document.removeEventListener('mouseleave', onMouseLeave);
	// 	};
	// });

	return {
		commentCursorRef,
	};
}
