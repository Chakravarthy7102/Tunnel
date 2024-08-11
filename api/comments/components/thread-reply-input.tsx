'use client';

import { useComments } from '#hooks/comments.ts';
import {
	useThreadInputEditorKeydownHandler,
	useThreadInputEditorProps,
	useThreadInputFileButtonProps,
} from '#hooks/thread-input.ts';
import type { CommentsContext } from '#types';
import { type ClientDoc, type ClientFlatDoc, createDoc } from '@-/client-doc';
import { createIdPair } from '@-/database';
import type {
	ProjectComment_$commentsProviderData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import { Button, cn } from '@-/design-system/v1';
import type { Editor } from '@tiptap/react';
import { Image } from 'lucide-react';
import { useState } from 'react';
import {
	threadInputContainerVariants,
	threadInputPlateVariants,
} from './thread-input-ui.tsx';
import { FilesRow } from './thread-input/files-row.tsx';
import { TiptapEditor } from './tiptap/editor.tsx';

export interface ThreadReplyInputProps {
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
	editor: Editor;
	initialFiles?: File[];
	onSubmit?(args: {
		comment: ClientFlatDoc<
			typeof ProjectComment_$commentsProviderData
		>;
	}): void;

	// Style props
	variant?: 'default' | 'toolbar' | 'toolbarReply';
	style?: React.CSSProperties;
}

export function ThreadReplyInput({
	commentsContext,
	commentThread,
	editor,
	onSubmit,
	initialFiles,
	...uiProps
}: ThreadReplyInputProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<File[]>(initialFiles ?? []);
	const { addComment, commentsState } = useComments(commentsContext);

	const isEditorEmpty = editor.getText().trim() === '';

	const handleSubmit = () => {
		if (isEditorEmpty) return;

		setIsLoading(true);
		const [setProjectCommentServerId, projectCommentClientId] = createIdPair(
			'ProjectComment',
		);

		const createProjectCommentAction = createDoc.action(
			'ProjectComment',
			(create) =>
				create<typeof ProjectComment_$commentsProviderData>({
					_id: projectCommentClientId,
					_creationTime: Date.now(),
					content: editor.getJSON().content ?? [],
					contentTextContent: editor.getText(),
					files: [],
					authorInformation: null,
					slackMetadata: null,
					sentBySlack: false,
					authorUser: { _id: commentsState.actorUserId },
					updatedAt: Date.now(),
					parentCommentThread: { _id: commentThread._id },
				}),
		);

		editor.commands.clearContent();
		editor.commands.setContent('');

		void addComment.server(
			(state) => {
				state = createProjectCommentAction(state);
				return addComment.action({
					comment: createProjectCommentAction.flatDoc,
				})(state);
			},
			{ comment: createProjectCommentAction.flatDoc, files },
		).then((comment) => {
			if (comment.isOk()) {
				setProjectCommentServerId(comment.value._id);
			}
		});

		onSubmit?.({ comment: createProjectCommentAction.flatDoc });
		setIsLoading(false);
		setFiles([]);
	};

	useThreadInputEditorKeydownHandler({ editor, onSubmit: handleSubmit });
	const editorProps = useThreadInputEditorProps({
		editor,
		onSubmit: handleSubmit,
		setFiles,
	});
	const fileButtonProps = useThreadInputFileButtonProps({
		setFiles,
	});

	return (
		<div
			className={cn(
				threadInputContainerVariants({ variant: uiProps.variant }),
				'w-full',
			)}
		>
			<TiptapEditor
				className={threadInputPlateVariants({ variant: uiProps.variant })}
				{...editorProps}
			/>
			<FilesRow
				commentsContext={commentsContext}
				files={files}
				setFiles={setFiles}
				sessionEventsFile={null}
				sessionEventsThumbnailFile={null}
				setSessionEvents={null}
				setSessionEventsThumbnail={null}
				initialFilePromise={null}
				setInitialFilePromise={null}
			/>
			<div className="flex flex-col items-center justify-between w-full py-3 md:flex-row gap-2">
				<div className="flex flex-row md:justify-center justify-start items-center gap-x-1 justify-start w-full md:w-auto">
					<div>
						<Button
							variant="outline"
							onClick={fileButtonProps.handleClick}
							size="sm"
							className="w-8 h-8 p-0 rounded-full"
						>
							<Image size={14} />
						</Button>
						<input
							type="file"
							style={{ display: 'none' }}
							ref={fileButtonProps.fileInput}
							onChange={fileButtonProps.handleFileChange}
							accept="image/*"
						/>
					</div>
				</div>

				<div className="flex flex-row justify-end md:w-auto w-full items-center gap-x-2 md:justify-center ">
					<div className="flex flex-row justify-center">
						<Button
							variant="blue"
							size="sm"
							disabled={isEditorEmpty || isLoading}
							isLoading={isLoading}
							onClick={handleSubmit}
						>
							Create
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
