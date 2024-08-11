import type { CommentsAction, CommentsContext, CommentsState } from '#types';
import {
	type AnyCollections,
	type ClientFlatDoc,
	createDoc,
	select,
	updateDoc,
} from '@-/client-doc';
import { useUploadFiles } from '@-/convex/react';
import type { EmptySelection, Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	type ProjectComment_$commentsProviderData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import type {
	ConsoleLogEntry,
	NetworkLogEntry,
} from '@-/logs';
import type { JSONContent } from '@tiptap/react';
import arrayUnique from 'array-uniq';
import { $try, ok } from 'errok';
import { jsonl } from 'js-jsonl';
import mapObject from 'map-obj';
import { useRef } from 'react';
import Resolvable from 'resolvable-promise';

export function useComments(commentsContext: CommentsContext) {
	const { commentsState, setCommentsState, trpc } = commentsContext;
	const { uploadFiles } = useUploadFiles({
		actorUserId: commentsState.actorUserId,
	});
	const createCommentMutation = trpc.projectComment.create.useMutation();
	const createCommentWithThreadMutation = trpc.projectComment.createWithThread
		.useMutation();
	const updateCommentMutation = trpc.projectComment.update.useMutation();
	const deleteCommentMutation = trpc.projectComment.delete.useMutation();
	const resolveThreadMutation = trpc.projectCommentThread.resolve.useMutation();
	const unresolveCommentThreadMutation = trpc.projectCommentThread.unresolve
		.useMutation();
	const deleteThreadMutation = trpc.projectCommentThread.delete.useMutation();
	const generateIntegrationTitle = trpc.projectCommentThread.generate
		.useMutation();
	const createJiraIssueMutation = trpc.jira.createIssue.useMutation();
	const createLinearIssueMutation = trpc.linear.createIssue.useMutation();
	const createAsanaTaskMutation = trpc.asana.createTask.useMutation();
	const createSlackMessageMutation = trpc.slack.createMessage.useMutation();
	const addSlackIntegrationMutation = trpc.projectCommentThread
		.addSlackIntegration.useMutation();
	const addLinearIntegrationMutation = trpc.projectCommentThread
		.addLinearIntegration.useMutation();
	const addJiraIntegrationMutation = trpc.projectCommentThread
		.addJiraIntegration.useMutation();
	const addAsanaIntegrationMutation = trpc.projectCommentThread
		.addAsanaIntegration.useMutation();

	async function withAction<$ReturnType extends { then(...args: any[]): any }>(
		action: CommentsAction,
		cb: (state: CommentsState) => $ReturnType,
	): Promise<$ReturnType> {
		const resolvable = new Resolvable<$ReturnType>();
		let actionId!: number;
		setTimeout(() => {
			setCommentsState((state) => {
				state = action(state);
				actionId = state.$nextPendingActionId;
				return {
					...state,
					$pendingActions: [
						...state.$pendingActions,
						{ action, id: actionId },
					],
					$nextPendingActionId: state.$nextPendingActionId + 1,
				};
			}, (state) => {
				resolvable.resolve(
					cb(state).then((result: any) => {
						setCommentsState((state) => ({
							...state,
							// eslint-disable-next-line max-nested-callbacks -- TODO
							$pendingActions: state.$pendingActions.filter((pendingAction) =>
								pendingAction.id !== actionId
							),
						}));
						return result;
					}),
				);
			});
		}, 0);
		return resolvable;
	}

	const deleteCommentThread = {
		action({ commentThreadId }: { commentThreadId: string }): <
			$State extends { $collections: AnyCollections; commentThreadIds: any[] },
		>(state: $State) => $State {
			return (state) => ({
				...state,
				$collections: {
					...state.$collections,
					ProjectCommentThread: {
						...state.$collections.ProjectCommentThread,
						[commentThreadId]: null,
					},
					ProjectComment: {
						...state.$collections.ProjectComment,
						...(
							Object.fromEntries(
								(state.$collections.ProjectCommentThread[commentThreadId]
									?.comments ?? [])
									.map(({ _id }) => [_id, null]),
							)
						),
					},
				},
				commentThreadIds: state.commentThreadIds.filter(
					(cid) => cid !== commentThreadId,
				),
			});
		},
		server: async (
			action: CommentsAction,
			{ commentThreadId }: {
				commentThreadId: Id<'ProjectCommentThread'>;
			},
		) => (withAction(
			action,
			async (state) => (deleteThreadMutation.mutateAsync({
				actor: state.userActor,
				projectCommentThread: {
					id: commentThreadId,
				},
			})),
		)),
	};

	const resolveCommentThread = {
		action({ commentThreadId, resolvedByUserId }: {
			commentThreadId: Id<'ProjectCommentThread'>;
			resolvedByUserId: Id<'User'>;
		}): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return updateDoc.action(
				'ProjectCommentThread',
				commentThreadId,
				(commentThread) => ({
					...commentThread,
					resolvedByUser: resolvedByUserId,
				}),
			);
		},
		server: async (
			action: CommentsAction,
			{ commentThreadId }: {
				commentThreadId: Id<'ProjectCommentThread'>;
			},
		) => (withAction(
			action,
			async (state) => (resolveThreadMutation.mutateAsync({
				actor: state.userActor,
				resolvedByUser: {
					id: state.userActor.data.id,
				},
				commentThread: { id: commentThreadId },
				hostEnvironmentType: state.hostEnvironmentType,
			})),
		)),
	};

	const unresolveCommentThread = {
		action(
			{ commentThreadId }: {
				commentThreadId: Id<'ProjectCommentThread'>;
			},
		): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return updateDoc.action(
				'ProjectCommentThread',
				commentThreadId,
				(commentThread) => ({
					...commentThread,
					resolvedByUser: null,
				}),
			);
		},
		server: async (
			action: CommentsAction,
			{ commentThreadId }: {
				commentThreadId: Id<'ProjectCommentThread'>;
			},
		) => (withAction(
			action,
			async (state) => (unresolveCommentThreadMutation.mutateAsync({
				actor: state.userActor,
				commentThread: {
					id: commentThreadId,
				},
			})),
		)),
	};

	const addCommentThread = {
		action({ commentThreadId }: {
			commentThreadId: Id<'ProjectCommentThread'>;
		}): <
			$State extends {
				$collections: AnyCollections;
				commentThreadIds: Id<'ProjectCommentThread'>[];
			},
		>(
			state: $State,
		) => $State {
			return (state) => ({
				...state,
				commentThreadIds: arrayUnique([
					...state.commentThreadIds,
					commentThreadId,
				]),
			});
		},
		async server(
			action: CommentsAction,
			{
				commentThread: flatCommentThread,
				firstComment,
				files,
				consoleLogs,
				networkLogEntries,
				sessionEventsFile,
				sessionEventsThumbnailFile,
			}: {
				commentThread: ClientFlatDoc<
					typeof ProjectCommentThread_$commentsProviderData
				>;
				firstComment: ClientFlatDoc<
					typeof ProjectComment_$commentsProviderData
				>;
				files: File[];
				consoleLogs: ConsoleLogEntry[] | null;
				networkLogEntries: NetworkLogEntry[] | null;
				sessionEventsFile: File | null;
				sessionEventsThumbnailFile: File | null;
			},
		) {
			return withAction(
				action,
				(state) => ($try(async function*() {
					const uploadedFiles = files.length === 0 ?
						[] :
						await uploadFiles(files);

					const createFileActions = uploadedFiles.map((uploadedFile) => {
						return createDoc.action(
							'File',
							(create) => create<EmptySelection<'File'>>(uploadedFile),
						);
					});

					setCommentsState((state) => {
						for (const createFileAction of createFileActions) {
							state = createFileAction(state);
						}

						return updateDoc.action(
							'ProjectComment',
							firstComment._id,
							(comment) => ({
								...comment,
								// eslint-disable-next-line max-nested-callbacks -- TODO
								files: createFileActions.map((createFileAction) => ({
									_id: createFileAction._id,
								})),
							}),
						)(state);
					});

					const commentThread = select(
						state,
						'ProjectCommentThread',
						flatCommentThread._id,
						getInclude(ProjectCommentThread_$commentsProviderData),
					);

					const [
						uploadedConsoleLogsFile,
						uploadedNetworkLogEntriesFile,
						uploadedSessionEventsFile,
						uploadedSessionEventsThumbnailFile,
					] = await Promise.all([
						consoleLogs === null ?
							null :
							uploadFiles([
								new File([jsonl.stringify(consoleLogs)], 'console-logs.jsonl'),
							]).then((files) => files[0] ?? null),
						networkLogEntries === null ?
							null :
							uploadFiles([
								new File(
									[jsonl.stringify(networkLogEntries)],
									'network-logs.jsonl',
								),
							]).then((files) => files[0] ?? null),
						sessionEventsFile === null ?
							null :
							uploadFiles([sessionEventsFile])
								.then((files) => files[0] ?? null),
						sessionEventsThumbnailFile === null ?
							null :
							uploadFiles([sessionEventsThumbnailFile])
								.then((files) => files[0] ?? null),
					]);

					const serverCommentThread =
						yield* (await createCommentWithThreadMutation.mutateAsync({
							actor: state.userActor,
							anchorElementXpath: commentThread.anchorElementXpath,
							files: uploadedFiles.map((uploadedFile) => uploadedFile._id),
							content: firstComment.content,
							contentTextContent: firstComment.contentTextContent,
							percentageTop: commentThread.percentageTop,
							percentageLeft: commentThread.percentageLeft,
							route: commentThread.route,
							projectLivePreview:
								commentThread.linkedProjectLivePreview === null ?
									null :
									{ id: commentThread.linkedProjectLivePreview._id },
							project: {
								id: commentThread.project._id,
							},
							createdJiraIssue: null,
							createdLinearIssue: null,
							createdSlackMessage: null,
							windowMetadata: commentThread.windowMetadata_,
							gitMetadata: commentThread.gitMetadata_,
							authorUser: {
								id: commentsState.actorUserId,
							},
							sessionEventsFile: uploadedSessionEventsFile?._id ?? null,
							sessionEventsThumbnailFile:
								uploadedSessionEventsThumbnailFile?._id ?? null,
							consoleLogsFile: uploadedConsoleLogsFile?._id ?? null,
							consoleLogEntriesCount: consoleLogs?.length ?? 0,
							networkLogEntriesFile: uploadedNetworkLogEntriesFile?._id ?? null,
							networkLogEntriesCount: networkLogEntries?.length ?? 0,
							hostEnvironmentType: commentsState.hostEnvironmentType,
						})).safeUnwrap();

					return ok({
						...serverCommentThread,
						files: uploadedFiles.map((file) => ({
							...file,
							_creationTime: Date.now(),
							md5Hash: '',
							filepath: '',
						})),
					});
				})),
			);
		},
	};

	const addComment = {
		action({ comment }: {
			comment: ClientFlatDoc<typeof ProjectComment_$commentsProviderData>;
		}): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return (state) => {
				const commentThread = select(
					state,
					'ProjectCommentThread',
					comment.parentCommentThread._id,
					{ comments: true },
				);

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (commentThread === null) {
					return state;
				}

				return updateDoc.action(
					'ProjectCommentThread',
					commentThread._id,
					(commentThread) => ({
						...commentThread,
						comments: arrayUnique([
							// @ts-expect-error: todo
							...(commentThread.comments ?? []),
							{ _id: comment._id },
						]),
					}),
				)(state);
			};
		},
		async server(
			action: CommentsAction,
			{
				comment,
				files,
			}: {
				comment: Omit<
					ClientFlatDoc<typeof ProjectComment_$commentsProviderData>,
					'files'
				>;
				files: File[];
			},
		) {
			const {
				content,
				contentTextContent,
				parentCommentThread,
			} = comment;
			return withAction(
				action,
				async (state) => {
					const uploadedFiles = files.length === 0 ?
						[] :
						await uploadFiles(files);
					const createFileActions = uploadedFiles.map((uploadedFile) => {
						return createDoc.action(
							'File',
							(create) => create<EmptySelection<'File'>>(uploadedFile),
						);
					});
					setCommentsState((state) => {
						for (const createFileAction of createFileActions) {
							state = createFileAction(state);
						}

						return updateDoc.action(
							'ProjectComment',
							comment._id,
							(comment) => ({
								...comment,
								files: createFileActions.map((createFileAction) => ({
									_id: createFileAction._id,
								})),
							}),
						)(state);
					});
					return createCommentMutation.mutateAsync({
						actor: state.userActor,
						authorUser: {
							id: state.userActor.data.id,
						},
						files: uploadedFiles.map((uploadedFile) => uploadedFile._id),
						content,
						contentTextContent,
						parentCommentThread: {
							id: parentCommentThread._id,
						},
						hostEnvironmentType: state.hostEnvironmentType,
					});
				},
			);
		},
	};

	const updateComment = {
		action(
			{ commentId, content }: {
				commentId: Id<'ProjectComment'>;
				content: JSONContent[];
			},
		): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return updateDoc.action('ProjectComment', commentId, (comment) => ({
				...comment,
				content,
			}));
		},
		server: async (
			action: CommentsAction,
			{ commentId, content }: {
				commentId: Id<'ProjectComment'>;
				content: JSONContent[];
			},
		) => (withAction(
			action,
			async () => (updateCommentMutation.mutateAsync({
				actor: commentsState.userActor,
				comment: {
					id: commentId,
				},
				updates: {
					content,
				},
			})),
		)),
	};

	const deleteComment = {
		action(
			{ commentId }: { commentId: Id<'ProjectComment'> },
		): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return (state) => {
				const parentCommentThreadId = state.$collections
					.ProjectComment[commentId]?.parentCommentThread?._id;
				const isFirstComment = parentCommentThreadId === undefined ?
					false :
					state.$collections.ProjectCommentThread[parentCommentThreadId]
						?.comments?.[0]?._id === commentId;

				if (isFirstComment) {
					return {
						...state,
						$collections: {
							...state.$collections,
							ProjectCommentThread: {
								...state.$collections.ProjectCommentThread,
								...(parentCommentThreadId === undefined ?
									{} :
									{ [parentCommentThreadId]: null }),
							},
							ProjectComment: {
								...state.$collections.ProjectComment,
								[commentId]: null,
							},
						},
					};
				} else {
					return {
						...state,
						$collections: {
							...state.$collections,
							ProjectComment: {
								...state.$collections.ProjectComment,
								[commentId]: null,
							},
							ProjectCommentThread: mapObject(
								state.$collections.ProjectCommentThread,
								(cid, commentThread) =>
									commentThread === null ? [cid, null] : [
										cid,
										commentThread._id === parentCommentThreadId ?
											{
												...commentThread,
												comments: commentThread.comments?.filter(({ _id }) =>
													_id !== commentId
												),
											} :
											commentThread,
									],
							),
						},
					};
				}
			};
		},
		server: async (
			action: CommentsAction,
			{ commentId }: { commentId: Id<'ProjectComment'> },
		) => (withAction(
			action,
			async (state) => (deleteCommentMutation.mutateAsync({
				actor: state.userActor,
				projectComment: {
					id: commentId,
				},
			})),
		)),
	};

	const setFocusedCommentThread = {
		action({ commentThreadId }: {
			commentThreadId:
				| Id<'ProjectCommentThread'>
				| null;
		}): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return (state) => ({
				...state,
				focusedCommentThreadId: commentThreadId,
			});
		},
	};

	const setActiveCommentThread = {
		action({ commentThreadId }: {
			commentThreadId:
				| Id<'ProjectCommentThread'>
				| null;
		}): <$State extends { $collections: AnyCollections }>(
			state: $State,
		) => $State {
			return (state) => ({
				...state,
				activeCommentThreadId: commentThreadId,
			});
		},
	};

	const currentResolvedCommentThreadTimeouts = useRef<
		Record<string, NodeJS.Timeout>
	>({});

	const addResolvedCommentThread = {
		action({
			commentThreadId,
		}: {
			commentThreadId: Id<'ProjectCommentThread'>;
		}): <
			$State extends {
				$collections: AnyCollections;
				currentResolvedCommentThreadIds: string[];
			},
		>(
			state: $State,
		) => $State {
			return (state) => {
				currentResolvedCommentThreadTimeouts.current[commentThreadId] =
					setTimeout(
						() => {
							setCommentsState((state) => ({
								...state,
								currentResolvedCommentThreadIds: state
									.currentResolvedCommentThreadIds
									.filter(
										(cid) => cid !== commentThreadId,
									),
							}));
						},
						2000,
					);

				return {
					...state,
					currentResolvedCommentThreadIds: [
						...state.currentResolvedCommentThreadIds,
						commentThreadId,
					],
				};
			};
		},
	};

	const removeResolvedCommentThread = {
		action({
			commentThreadId,
		}: {
			commentThreadId: Id<'ProjectCommentThread'>;
		}): <
			$State extends {
				$collections: AnyCollections;
				currentResolvedCommentThreadIds: string[];
			},
		>(
			state: $State,
		) => $State {
			return (state) => {
				clearTimeout(
					currentResolvedCommentThreadTimeouts.current[commentThreadId],
				);

				return {
					...state,
					currentResolvedCommentThreadIds: state
						.currentResolvedCommentThreadIds
						.filter(
							(cid) => cid !== commentThreadId,
						),
				};
			};
		},
	};

	return {
		commentsState,
		setCommentsState,
		trpc,
		addComment,
		addCommentThread,
		deleteComment,
		updateComment,
		unresolveCommentThread,
		resolveCommentThread,
		deleteCommentThread,
		setFocusedCommentThread,
		setActiveCommentThread,
		addResolvedCommentThread,
		removeResolvedCommentThread,
		createJiraIssueMutation,
		createSlackMessageMutation,
		createLinearIssueMutation,
		createAsanaTaskMutation,
		generateIntegrationTitle,
		addSlackIntegrationMutation,
		addLinearIntegrationMutation,
		addJiraIntegrationMutation,
		addAsanaIntegrationMutation,
	};
}
