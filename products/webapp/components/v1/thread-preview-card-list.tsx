'use client';

import type { ClientDoc } from '@-/client-doc';
import { type CommentsContext, ThreadPreviewCard } from '@-/comments';
import type { ProjectCommentThread_$commentsProviderData } from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const ThreadPreviewCardList = ({
	commentsContext,
	isDone,
	isLoading,
	commentThreads,
	organization,
	loadMore,
}: {
	commentsContext: CommentsContext;
	isDone: boolean;
	isLoading: boolean;
	commentThreads: ClientDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>[];
	organization: { slug: string };
	loadMore: (numItems: number) => void;
}) => {
	const router = useRouter();

	return (
		<>
			{commentThreads.map((commentThread) => (
				<ThreadPreviewCard
					key={commentThread._id}
					commentsContext={commentsContext}
					commentThread={commentThread}
					onExpand={() => {
						router.push(
							`/${organization.slug}/comments/${commentThread._id}`,
						);
					}}
					showProject={true}
				/>
			))}
			{!isDone && !isLoading && (
				<Button
					onClick={() => loadMore(10)}
					className="w-full h-10"
				>
					<ArrowDown size={14} /> Load more
				</Button>
			)}
		</>
	);

	// TODO: make react-window work with thread-input box scroll
	// const sizeMap = useRef<Record<string, number>>({});
	// const getSize = useCallback(
	// 	(commentThreadId: string) => sizeMap.current[commentThreadId] ?? 150,
	// 	[],
	// );
	// const isItemLoaded = (
	// 	index: number,
	// ) => (isDone || index < commentThreads.length);
	// const itemCount = isDone ? commentThreads.length + 1 : commentThreads.length;
	// return (
	// 	<InfiniteLoader
	// 		isItemLoaded={isItemLoaded}
	// 		itemCount={itemCount}
	// 		loadMoreItems={(startIndex: number, stopIndex: number) => {
	// 			loadMore(stopIndex - startIndex + 1);
	// 		}}
	// 	>
	// 		{({ onItemsRendered, ref }) => (
	// 			<VariableSizeList
	// 				itemCount={itemCount}
	// 				onItemsRendered={onItemsRendered}
	// 				ref={ref}
	// 				height={800}
	// 				width="100%"
	// 				itemSize={(index: number) => {
	// 					const commentThread = commentThreads[index];
	// 					if (commentThread === undefined) {
	// 						return 0;
	// 					}

	// 					return getSize(commentThread._id);
	// 				}}
	// 			>
	// 				{Item}
	// 			</VariableSizeList>
	// 		)}
	// 	</InfiniteLoader>
	// );
};
