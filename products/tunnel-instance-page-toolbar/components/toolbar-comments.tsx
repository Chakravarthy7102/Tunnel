import { EscapeTag } from '#components/comments/escape-tag.tsx';
import { InboxDrawer } from '#components/comments/inbox/inbox-drawer.tsx';
import { DialogThreadBox } from '#components/comments/input-boxes/dialog-thread-box.tsx';
import { PendingThreadBox } from '#components/comments/input-boxes/pending-thread-box.tsx';
import { CommentIcons } from '#components/comments/lists/comment-icons.tsx';
import { CommentThreadBoxes } from '#components/comments/lists/comment-thread-boxes.tsx';
import { ShareDialog } from '#components/dialogs/share-dialog.tsx';
import { VideoBubble } from '#components/video/bubble.tsx';
import type { PageToolbarContext } from '#types';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { ErrorBoundary } from 'react-error-boundary';

export function ToolbarComments({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);

	return (
		<>
			<ErrorBoundary fallback={null}>
				<CommentIcons context={context} />
			</ErrorBoundary>

			<ErrorBoundary fallback={null}>
				<CommentThreadBoxes context={context} />
			</ErrorBoundary>

			<ErrorBoundary fallback={null}>
				<EscapeTag context={context} />
			</ErrorBoundary>

			<ErrorBoundary fallback={null}>
				<PendingThreadBox context={context} />
			</ErrorBoundary>

			<ErrorBoundary fallback={null}>
				<DialogThreadBox context={context} />
			</ErrorBoundary>

			<ErrorBoundary fallback={null}>
				<InboxDrawer context={context} />
			</ErrorBoundary>

			{isContext(context, state, { hasProjectLivePreview: true }) && (
				<ErrorBoundary fallback={null}>
					<ShareDialog context={context} />
				</ErrorBoundary>
			)}
			{isContext(context, state, {
				hasProjectLivePreview: true,
			}) &&
				state.hasUserJoinedDailyRoom &&
				(
					<ErrorBoundary fallback={null}>
						<VideoBubble context={context} />
					</ErrorBoundary>
				)}
		</>
	);
}
