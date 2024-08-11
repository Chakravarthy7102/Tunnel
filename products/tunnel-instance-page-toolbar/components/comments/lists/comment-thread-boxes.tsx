import { FocusedThreadBox } from '#components/comments/input-boxes/focused-thread-box.tsx';
import { useCommentThreadAbsolutePositions } from '#hooks/comment-position.ts';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { select } from '@-/client-doc';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';

export function CommentThreadBoxes({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	const { getCommentThreadAbsolutePosition } =
		useCommentThreadAbsolutePositions({
			context,
			isScrollAware: false,
		});
	const commentThreads = state.commentThreadIds.map((cid) =>
		select(
			state,
			'ProjectCommentThread',
			cid,
			getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
		)
	);

	return (
		<>
			{commentThreads.map((commentThread) => {
				if (
					commentThread.resolvedByUser !== null ||
					commentThread.route !== window.location.pathname
				) {
					return null;
				}

				const absolutePosition = getCommentThreadAbsolutePosition({
					commentThreadId: commentThread._id,
				});

				if (absolutePosition === null) {
					return null;
				}

				return (
					<FocusedThreadBox
						key={clientId(commentThread._id)}
						context={context}
						x={absolutePosition.x}
						y={absolutePosition.y}
						commentThread={commentThread}
					/>
				);
			})}
		</>
	);
}
