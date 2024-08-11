import type { CommentsContext } from '#types';
import type { ClientDoc } from '@-/client-doc';
import { type JSONContent, useEditor } from '@tiptap/react';
import { useExtensions } from './extensions.ts';

export function useFullEditor({
	commentsContext,
	organization,
	initialContent,
	readOnly = false,
}: {
	initialContent?: JSONContent[];
	readOnly?: boolean;
	commentsContext: CommentsContext;
	organization: ClientDoc<'Organization'> | null;
}) {
	const extensions = useExtensions({
		commentsContext,
		organization,
	});

	const editor = useEditor({
		editable: !readOnly,
		extensions,
		content: {
			type: 'doc',
			content: initialContent ?? [
				{
					type: 'paragraph',
				},
			],
		},
	});

	return editor;
}
