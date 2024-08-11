import './styles/styles.css';
import './styles/mention.css';
import { useFullEditor } from '#components/tiptap/hooks/full-editor.ts';
import type { CommentsContext } from '#types';
import {
	type Editor,
	EditorContent,
	type EditorContentProps,
	type JSONContent,
} from '@tiptap/react';
import React from 'react';

export type TiptapEditorProps = Omit<EditorContentProps, 'editor'> & {
	editor: Editor;
};

interface ReadTiptapEditorProps {
	ref?: React.Ref<HTMLDivElement>;
	content: JSONContent[];
	className?: string;
	commentsContext: CommentsContext;
}

export function TiptapEditor({ editor, ...props }: TiptapEditorProps) {
	const { ref: _, ...rest } = props;

	return (
		<EditorContent
			editor={editor}
			className="w-full py-3"
			{...rest}
		/>
	);
}

export function ReadTiptapEditor({
	content,
	commentsContext,
	...rest
}: ReadTiptapEditorProps) {
	const editor = useFullEditor({
		organization: null,
		initialContent: content,
		readOnly: true,
		commentsContext,
	});

	return <EditorContent editor={editor} {...rest} />;
}
