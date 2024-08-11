'use client';

import { useRealtimeAction, useRealtimeActions } from '#utils/action.ts';
import {
	type AnyCollections,
	createDoc,
	noopAction,
} from '@-/client-doc';
import { useMemoizedAction } from '@-/client-doc/react';
import type {
	CommentsAction,
	CommentsContext,
	CommentsState,
} from '@-/comments';
import {
	type ServerDoc,
	serverIdToClientId,
} from '@-/database';
import type {
	OrganizationMember_$actorProfileData,
	ProjectCommentThread_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import * as tables from '@-/database/tables';
import { HostEnvironmentType } from '@-/host-environment';
import { useStateWithCallbackLazy } from '@tunnel/use-state-with-callback';
import arrayUnique from 'array-uniq';
import mapObject from 'map-obj';
import { useEffect, useMemo } from 'react';
import { useDocumentBody } from './document.ts';
import { trpc } from './trpc.ts';

export function useCommentsContext({
	actorUser,
	actorOrganizationMember,
	memoizedCommentThreads,
	memoizedActions,
}: {
	actorUser: ServerDoc<typeof User_$profileData>;
	actorOrganizationMember:
		| ServerDoc<
			typeof OrganizationMember_$actorProfileData
		>
		| null;
	memoizedCommentThreads: ServerDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>[];
	memoizedActions: CommentsAction[];
}): CommentsContext {
	const documentBody = useDocumentBody();

	const createActorUserAction = useMemoizedAction(createDoc.action(
		'User',
		(create) => create<typeof User_$profileData>(actorUser),
	));

	const createActorOrganizationMemberAction = useMemoizedAction(
		actorOrganizationMember === null ?
			noopAction :
			createDoc.action(
				'OrganizationMember',
				(create) =>
					create<typeof OrganizationMember_$actorProfileData>(
						actorOrganizationMember,
					),
			),
	);

	const createCommentThreadActions = useMemo(
		() =>
			memoizedCommentThreads.map((commentThread) =>
				createDoc.action(
					'ProjectCommentThread',
					(create) =>
						create<typeof ProjectCommentThread_$commentsProviderData>(
							commentThread,
						),
				)
			),
		[memoizedCommentThreads],
	);

	const [commentsState, setCommentsState] = useStateWithCallbackLazy<
		CommentsState
	>(
		() => {
			let state: CommentsState = {
				$collections: mapObject(
					tables,
					(tableName) => [tableName as string, {}],
				) as AnyCollections,
				$pendingActions: [],
				$nextPendingActionId: 0,
				userActor: { type: 'User', data: { id: actorUser._id } },
				actorUserId: createActorUserAction._id,
				commentThreadIds: [],
				activeCommentThreadId: null,
				focusedCommentThreadId: null,
				actorOrganizationMemberId:
					'_id' in createActorOrganizationMemberAction ?
						createActorOrganizationMemberAction._id :
						null,
				currentResolvedCommentThreadIds: [],
				container: documentBody,
				shadowRoot: null,
				filteredProjectCommentThreadIds: [],
				hostEnvironmentType: HostEnvironmentType.dashboard,
			};

			state = createActorUserAction(state);
			state = createActorOrganizationMemberAction(state);

			for (const createCommentThreadAction of createCommentThreadActions) {
				// For a brief time, comment threads can have 0 comments in them on the server-side; this if statement prevents Convex's real-time update from overwriting the existing comment thread that had comments created client-side
				if (
					createCommentThreadAction.flatDoc.comments === undefined ||
					createCommentThreadAction.flatDoc.comments.length > 0
				) {
					state = createCommentThreadAction(state);
					state = {
						...state,
						commentThreadIds: arrayUnique([
							...state.commentThreadIds,
							createCommentThreadAction._id,
						]),
					};
				}
			}

			for (const memoizedAction of memoizedActions) {
				state = memoizedAction(state);
			}

			return state;
		},
	);

	useEffect(() => {
		setCommentsState((state) => {
			let commentThreadIds = [...state.commentThreadIds]
				// We filter out comments that have been deleted client-side
				.filter(
					(commentThreadId) =>
						state.$collections.ProjectCommentThread[commentThreadId] !==
							null,
				);

			for (const createCommentThreadAction of createCommentThreadActions) {
				// For a brief time, comment threads can have 0 comments in them on the server-side; this if statement prevents Convex's real-time update from overwriting the existing comment thread that had comments created client-side
				if (
					createCommentThreadAction.flatDoc.comments === undefined ||
					createCommentThreadAction.flatDoc.comments.length > 0
				) {
					state = createCommentThreadAction(state);
					commentThreadIds.push(createCommentThreadAction._id);

					const clientId = serverIdToClientId.get(
						createCommentThreadAction._id,
					);
					commentThreadIds = commentThreadIds.filter(
						(commentThreadId) => commentThreadId !== clientId,
					);
				}
			}

			return {
				...state,
				commentThreadIds: arrayUnique(commentThreadIds),
			};
		});
	}, [createCommentThreadActions, setCommentsState]);

	useRealtimeAction(createActorUserAction, setCommentsState);
	useRealtimeAction(createActorOrganizationMemberAction, setCommentsState);
	useRealtimeActions(memoizedActions, setCommentsState);

	return {
		commentsState,
		setCommentsState,
		trpc,
	};
}
