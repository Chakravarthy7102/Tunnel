import { Drawer } from '#components/ui/drawer.tsx';
import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { select } from '@-/client-doc';
import { ThreadPreviewCard } from '@-/comments';
import { clientId } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import { ProjectCommentThread_$tunnelInstancePageToolbarData } from '@-/database/selections';
import {
	Button,
	cn,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@-/design-system/v1';
import { ArrowLeft, Check, ChevronDown, Inbox } from 'lucide-react';
import { useState } from 'react';
import { FullComment } from './full-comment.tsx';

export function InboxDrawer({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	const commentsContext = useCommentsContext({ context });
	const shadowRootElement = useShadowRootElement();
	const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
	const activeCommentThread = select(
		state,
		'ProjectCommentThread',
		state.activeCommentThreadId,
		getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
	);

	const commentThreads = state.commentThreadIds.map((commentThreadId) =>
		select(
			state,
			'ProjectCommentThread',
			commentThreadId,
			getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
		)
	);

	const [inboxFilter, setInboxFilter] = useState<{
		page: string;
		status: 'all' | 'resolved' | 'unresolved';
	}>({
		page: 'all',
		status: 'all',
	});

	const filteredThreads = commentThreads
		.filter((thread) => {
			if (inboxFilter.page === 'all') {
				return true;
			} else if (thread.route === inboxFilter.page) {
				return true;
			} else {
				return false;
			}
		})
		.filter((thread) => {
			if (inboxFilter.status === 'all') {
				return true;
			} else if (inboxFilter.status === 'resolved') {
				return thread.resolvedByUser !== null;
			} else {
				return thread.resolvedByUser === null;
			}
		});

	return (
		<Drawer
			isOpen={state.isInboxOpen}
			onClose={() => {
				context.store.setState({
					isInboxOpen: false,
					activeCommentThreadId: null,
				});
			}}
			title={state.activeCommentThreadId === null ?
				(
					<>
						<Popover
							open={isFilterPopoverOpen}
							onOpenChange={setIsFilterPopoverOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="font-medium flex flex-row justify-center items-center gap-4"
								>
									<div className="flex flex-row justify-center items-center gap-2">
										<Inbox size={12} />
										Inbox
									</div>
									<ChevronDown
										size={12}
										className={cn(
											'text-muted-foreground transform-gpu transition-transform',
											isFilterPopoverOpen ? 'rotate-180' : 'rotate-0',
										)}
									/>
								</Button>
							</PopoverTrigger>
							<PopoverContent
								container={shadowRootElement}
								align="start"
								className="flex flex-col justify-center items-center gap-y-3"
							>
								<div className="flex flex-col justify-center items-start w-full">
									<p className="text-sm text-light text-muted-foreground mb-1">
										Filter by preview
									</p>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											state.viewAllProjectComments ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											context.store.setState({
												viewAllProjectComments: true,
											});
											localStorage.setItem('viewAllProjectComments', 'true');
										}}
									>
										All previews
										{state.viewAllProjectComments && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											!state.viewAllProjectComments ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											context.store.setState({
												viewAllProjectComments: false,
											});
											localStorage.setItem('viewAllProjectComments', 'false');
										}}
									>
										This preview
										{!state.viewAllProjectComments && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
								</div>
								<div className="h-[1px] bg-input w-full"></div>
								<div className="flex flex-col justify-center items-start w-full">
									<p className="text-sm text-light text-muted-foreground mb-1">
										Filter by page
									</p>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											inboxFilter.page === 'all' ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											setInboxFilter({
												page: 'all',
												status: inboxFilter.status,
											});
										}}
									>
										All
										{inboxFilter.page === 'all' && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											inboxFilter.page === window.location.pathname ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											setInboxFilter({
												page: window.location.pathname,
												status: inboxFilter.status,
											});
										}}
									>
										Current Page
										{inboxFilter.page === window.location.pathname && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
								</div>
								<div className="h-[1px] bg-input w-full"></div>
								<div className="flex flex-col justify-center items-start w-full">
									<p className="text-sm text-light text-muted-foreground mb-1">
										Filter by status
									</p>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											inboxFilter.status === 'all' ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											setInboxFilter({
												page: inboxFilter.page,
												status: 'all',
											});
										}}
									>
										All
										{inboxFilter.status === 'all' && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											inboxFilter.status === 'resolved' ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											setInboxFilter({
												page: inboxFilter.page,
												status: 'resolved',
											});
										}}
									>
										Resolved
										{inboxFilter.status === 'resolved' && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
									<Button
										variant={'ghost'}
										className={cn(
											'w-full flex flex-row justify-between items-center h-10',
											inboxFilter.status === 'unresolved' ?
												'font-medium' :
												'font-normal',
										)}
										onClick={() => {
											setInboxFilter({
												page: inboxFilter.page,
												status: 'unresolved',
											});
										}}
									>
										Unresolved
										{inboxFilter.status === 'unresolved' && (
											<Check size={14} className="text-blue-600" />
										)}
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</>
				) :
				(
					<>
						<Button
							variant="outline"
							onClick={() => {
								context.store.setState({ activeCommentThreadId: null });
							}}
							className="gap-x-2"
						>
							<ArrowLeft size={12} className="text-muted-foreground" />
							Back
						</Button>
					</>
				)}
		>
			{state.activeCommentThreadId === null ?
				(
					<div className="flex flex-col justify-start items-center gap-2 w-full h-full">
						<div className="flex flex-col w-full justify-start items-center min-h-auto h-full pb-4 ">
							{filteredThreads.length > 0 ?
								(
									// need two different maps, one for resolved and one for unresolved
									<>
										{[...filteredThreads]
											.filter(
												(commentThread) =>
													commentThread.resolvedByUser === null,
											)
											.sort(
												(commentThread1, commentThread2) =>
													commentThread2._creationTime -
													commentThread1._creationTime,
											)
											.map((commentThread) => {
												return (
													<ThreadPreviewCard
														key={clientId(commentThread._id)}
														commentThread={commentThread}
														onExpand={() => {
															context.store.setState({
																activeCommentThreadId: commentThread._id,
															});
														}}
														commentsContext={commentsContext}
														pageInjectionContext={context}
														showProject={false}
													/>
												);
											})}
										{[...filteredThreads]
											.filter(
												(commentThread) =>
													commentThread.resolvedByUser !== null,
											)
											.sort(
												(commentThread1, commentThread2) =>
													commentThread2._creationTime -
													commentThread1._creationTime,
											)
											.map((commentThread) => {
												return (
													<ThreadPreviewCard
														key={clientId(commentThread._id)}
														commentThread={commentThread}
														onExpand={() => {
															context.store.setState({
																activeCommentThreadId: commentThread._id,
															});
														}}
														commentsContext={commentsContext}
														pageInjectionContext={context}
														showProject={false}
													/>
												);
											})}
									</>
								) :
								(
									<div className="flex flex-col justify-center items-center h-full gap-y-2">
										<Inbox size={64} className="text-muted-foreground" />
										<p className="text-muted-foreground">
											Nothing to see here, yet.
										</p>
									</div>
								)}
						</div>
					</div>
				) :
				(
					activeCommentThread && (
						<div className="flex flex-col justify-start items-center gap-2 w-full h-full">
							<FullComment
								context={context}
								commentThread={activeCommentThread}
							/>
						</div>
					)
				)}
		</Drawer>
	);
}
