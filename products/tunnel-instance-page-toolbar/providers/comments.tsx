import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { select } from '@-/client-doc';
import { useComments } from '@-/comments';
import { getInclude } from '@-/database/selection-utils';
import { ProjectCommentThread_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { logger } from '@-/logger';
import { RobulaPlus } from '@-/robula-plus';
import { getElementBySimiloXpath } from '@-/xpath';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';

export function ProjectCommentsProvider({
	children,
	context,
}: PropsWithChildren<{
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
		isOnline: true;
	}>;
}>) {
	const { trpc, trpcClient } = useCommentsContext({ context });
	const [queryClient] = useState(() => new QueryClient());

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient as any}>
			<QueryClientProvider client={queryClient}>
				<ProjectCommentsProviderInner context={context}>
					{children}
				</ProjectCommentsProviderInner>
			</QueryClientProvider>
		</trpc.Provider>
	);
}

function ProjectCommentsProviderInner({
	children,
	context,
}: PropsWithChildren<{
	context: PageToolbarContext<{
		actorType: 'User';
		hasProject: true;
		isOnline: true;
	}>;
}>) {
	const { webappTrpc } = getWebappTrpc({ context });
	const commentsContext = useCommentsContext({ context });
	const { setCommentsState } = useComments(commentsContext);
	const hashParams = new URLSearchParams(window.location.hash.slice(1));
	const hashCommentThreadId = hashParams.get('tunnel_comment');
	const [hasFocusedCommentThread, setHasFocusedCommentThread] = useState(false);
	const state = useContextStore(context);

	useEffect(() => {
		(async () => {
			const state = context.store.getState();
			const preloadedCommentThreads = (await webappTrpc.projectCommentThread
				.listPreloaded$tunnelInstancePageToolbarData.query({
					actor: state.actor,
					filtersSelection: null,
					// dprint-ignore
					...(
							isContext(context, state, { hasProjectLivePreview: true }) && !state.viewAllProjectComments ?
								{
									linkedProjectLivePreview: {
										// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
										id: state.projectLivePreviewId!
									}
							  } :
							{
								project: {
									id: state.projectId
								}
							}),
				})).unwrapOrThrow();

			context.store.setState((state) => ({
				...state,
				$preloaded: {
					...state.$preloaded,
					projectCommentThreads: preloadedCommentThreads,
				},
			}));
		})().catch((error) => {
			logger.error('Error fetching comments:', error);
		});
	}, [state.viewAllProjectComments]);

	useEffect(() => {
		if (hasFocusedCommentThread) {
			return;
		}

		const state = context.store.getState();

		if (hashCommentThreadId === null) {
			setHasFocusedCommentThread(true);
			return;
		}

		if (state.commentThreadIds.length === 0) {
			return;
		}

		const commentThread = select(
			state,
			'ProjectCommentThread',
			hashCommentThreadId,
			getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
		);

		if (commentThread === null) {
			setHasFocusedCommentThread(true);
			window.history.replaceState({}, '', window.location.pathname);
			return;
		}

		const { anchorElementXpath, xpathType } = commentThread;

		if (anchorElementXpath === null) {
			setHasFocusedCommentThread(true);
			window.history.replaceState({}, '', window.location.pathname);
			return;
		}

		let element: HTMLElement | null;
		if (xpathType !== 'similo') {
			const robula = new RobulaPlus();
			element = robula.getElementByXPath(anchorElementXpath, document);
		} else {
			element = getElementBySimiloXpath(
				anchorElementXpath,
				document,
			);
		}

		if (element !== null) {
			element.scrollIntoView({ behavior: 'smooth' });
		}

		setCommentsState((state) => ({
			...state,
			focusedCommentThreadId: commentThread._id,
		}));
	}, [state.commentThreadIds]);

	return children;
}
