'use client';

import type { Editor } from '@tiptap/react';
import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react';

export function useThreadInputEditorKeydownHandler({
	editor,
	onSubmit,
}: {
	editor: Editor | null;
	onSubmit: () => void;
}) {
	const isEditorEmpty = editor?.getText().trim() === '';

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.metaKey &&
				e.key === 'Enter' &&
				editor !== null &&
				editor.isFocused &&
				!isEditorEmpty
			) {
				onSubmit();
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onSubmit]);
}

export function useThreadInputFileButtonProps({
	setFiles,
}: {
	setFiles: Dispatch<SetStateAction<File[]>>;
}) {
	const fileInput = useRef<HTMLInputElement>(null);

	const handleClick = () => {
		if (fileInput.current) {
			fileInput.current.click();
			// Clear the input after clicking to ensure handleFileChange triggers even if the same file is selected again
			fileInput.current.value = '';
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];

			if (file) {
				setFiles((files) => [...files, file]);
			}
		}
	};

	return {
		fileInput,
		handleClick,
		handleFileChange,
	};
}

export function useThreadInputEditorProps({
	editor,
	onSubmit,
	setFiles,
}: {
	editor: Editor;
	onSubmit: () => void;
	setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
	const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
		e.preventDefault();

		const { clipboardData } = e;

		for (const item of clipboardData.items) {
			if (item.type.indexOf('image') === 0) {
				const file = item.getAsFile();

				if (file) {
					setFiles((files) => [...files, file]);
				}
			}
		}
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		const { dataTransfer } = e;
		const { items } = dataTransfer;

		const filesToDrop = [...items].filter(
			(item) => item.type.indexOf('image') === 0,
		);

		for (const item of filesToDrop) {
			const file = item.getAsFile();

			if (file) {
				setFiles((files) => [...files, file]);
			}
		}
	};

	return {
		editor,
		onPaste,
		onDragOver: (e: { preventDefault(): void }) => e.preventDefault(),
		onDrop,
		onSubmit,
	};
}
