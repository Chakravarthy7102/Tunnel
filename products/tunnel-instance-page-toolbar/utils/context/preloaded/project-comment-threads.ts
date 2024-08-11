import type { PageToolbarContext } from '#types';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import { clientIdToServerId, resolveId } from '@-/database';
import type { ProjectCommentThread_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { useEffect } from 'react';

export function usePreloadedCommentThreads({ context }: {
	context: PageToolbarContext;
}) {
	const state = useContextStore(context);
	const projectCommentThreads = useNullablePreloadedQuery(
		state.$preloaded.projectCommentThreads,
	);

	useEffect(() => {
		if (projectCommentThreads === null) {
			return;
		}

		const createCommentThreadActions = projectCommentThreads.page.map((
			commentThread,
		) =>
			createDoc.action(
				'ProjectCommentThread',
				(create) =>
					create<typeof ProjectCommentThread_$tunnelInstancePageToolbarData>(
						commentThread,
					),
			)
		);

		context.store.setState((state) => {
			const commentThreadIds = [];

			for (const createCommentThreadAction of createCommentThreadActions) {
				// For a brief time, comment threads can have 0 comments in them on the server-side; this if statement prevents Convex's real-time update from overwriting the existing comment thread that had comments created client-side
				if (
					createCommentThreadAction.flatDoc.comments === undefined ||
					createCommentThreadAction.flatDoc.comments.length > 0
				) {
					state = createCommentThreadAction(state);
					commentThreadIds.push(createCommentThreadAction._id);
				} else {
					// The project comment thread is only on the client, and so we only include the comment thread in the array if it's already there
					if (
						state.commentThreadIds?.includes(
							createCommentThreadAction.flatDoc._id,
						)
					) {
						commentThreadIds.push(createCommentThreadAction._id);
					}
				}
			}

			// We loop through the existing `commentThreadIds` array and add any comment threads that only have a client ID
			for (const commentThreadId of state.commentThreadIds ?? []) {
				const serverId = clientIdToServerId.get(commentThreadId);

				if (serverId === null) {
					commentThreadIds.push(commentThreadId);
				}
			}

			// Update the focused/active thread (e.g. in case they were deleted by another user)
			if (isContext(context, state, { hasProject: true })) {
				let { activeCommentThreadId, focusedCommentThreadId } = state;
				activeCommentThreadId = resolveId(activeCommentThreadId);
				focusedCommentThreadId = resolveId(focusedCommentThreadId);

				state = {
					...state,
					activeCommentThreadId,
					focusedCommentThreadId,
				};

				if (
					activeCommentThreadId !== null &&
					!commentThreadIds.includes(activeCommentThreadId)
				) {
					state = {
						...state,
						activeCommentThreadId: null,
						commentBoxPosition: null,
					};
				}

				if (
					focusedCommentThreadId !== null &&
					!commentThreadIds.includes(focusedCommentThreadId)
				) {
					state = {
						...state,
						focusedCommentThreadId: null,
						commentBoxPosition: null,
					};
				}
			}

			return {
				...state,
				commentThreadIds,
			};
		});
	}, [projectCommentThreads]);

	return projectCommentThreads;
}
