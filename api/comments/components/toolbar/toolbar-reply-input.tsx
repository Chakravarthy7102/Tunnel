'use client';

import { FilesRow } from '#components/thread-input/files-row.tsx';
import { TiptapEditor } from '#components/tiptap/editor.tsx';
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
import { toast } from '@-/tunnel-error';
import type { Editor } from '@tiptap/react';
import { Image } from 'lucide-react';
import { useState } from 'react';

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
}

export function ToolbarReplyInput({
	commentsContext,
	commentThread,
	editor,
	onSubmit,
	initialFiles,
}: ThreadReplyInputProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [files, setFiles] = useState<File[]>(initialFiles ?? []);
	const { addComment, commentsState } = useComments(commentsContext);

	const isEditorEmpty = editor.getText().trim() === '';

	const handleSubmit = () => {
		if (isEditorEmpty) return;

		const [
			setCommentServerId,
			commentClientId,
		] = createIdPair('ProjectComment');

		setIsLoading(true);
		const createProjectCommentAction = createDoc.action(
			'ProjectComment',
			(create) =>
				create<typeof ProjectComment_$commentsProviderData>({
					_id: commentClientId,
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
		).then((result) => {
			if (result.isErr()) {
				toast.error('Failed to create comment');
				return;
			}

			const comment = result.value;
			setCommentServerId(comment._id);
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
				'w-full bg-neutral-600 flex flex-col justify-center items-center',
			)}
		>
			<div className="p-2 border-b border-solid border-[#ffffff10] w-full flex flex-col justify-center items-center">
				<div className="rounded-[10px] bg-neutral-900 text-neutral-0 placeholder:text-neutral-500 text-sm w-full px-2 min-h-[32px] py-2 flex flex-col justify-start items-start gap-y-4">
					<TiptapEditor
						{...editorProps}
						className="w-full cursor-text"
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
				</div>
			</div>
			<div className="flex flex-row justify-between items-center w-full bg-neutral-600 p-2">
				<div className="flex flex-row md:justify-center justify-start items-center gap-x-1 justify-start w-full md:w-auto">
					<div>
						<Button
							variant="muratsecondary"
							onClick={fileButtonProps.handleClick}
							className="w-7 h-7 p-0 rounded-[10px]"
						>
							<Image size={16} />
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
							variant="muratblue"
							size="muratxs"
							disabled={isEditorEmpty || isLoading}
							isLoading={isLoading}
							onClick={handleSubmit}
							className="!p-2 !h-7 border border-solid !border-[#ffffff10]"
						>
							Create
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
