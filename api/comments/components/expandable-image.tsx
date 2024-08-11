'use client';

import { useComments } from '#hooks/comments.ts';
import type { CommentsContext } from '#types';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
	Dialog,
	DialogContentUnstyled,
	DialogTrigger,
} from '@-/design-system/v1';
import * as clipboard from 'clipboard-polyfill';
import { saveAs } from 'file-saver';
import React, { useState } from 'react';
import Parser from 'ua-parser-js';

export function ExpandableImage({
	commentsContext,
	...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
	commentsContext: CommentsContext;
	type: string | undefined;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const { commentsState } = useComments(commentsContext);

	const getImageBlob = async () => {
		if (!props.src) {
			return;
		}

		const { name, version } = new Parser().getBrowser();

		if (!name || !version) {
			return;
		}

		const imgSrcUrl = name === 'Safari' ? `${props.src}/` : props.src;

		return fetch(imgSrcUrl).then(async (res) => res.blob());
	};

	const copyImage = async () => {
		if (!props.src) {
			return;
		}

		const blob = await getImageBlob();

		if (!blob) {
			return;
		}

		// Firefox doesn't support `navigator.clipboard.write` or `ClipboardItem`
		return clipboard.write([
			new clipboard.ClipboardItem({ [blob.type]: blob }),
		]);
	};

	const saveImage = async () => {
		if (!props.src || !props.type) {
			return;
		}

		const blob = await getImageBlob();
		const ext = props.type.split('/')[1];

		if (!blob) {
			return;
		}

		saveAs(blob, `[Tunnel] ${new Date().toISOString()}.${ext}`);
	};

	const copyLink = async () => {
		if (!props.src) {
			return;
		}

		return navigator.clipboard.writeText(props.src);
	};

	const openLink = () => {
		if (!props.src) {
			return;
		}

		window.open(props.src, '_blank');
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<img
					{...props}
					alt={props.alt}
					className="hover:opacity-75 transition-opacity duration-200 hover:cursor-zoom-in"
				/>
			</DialogTrigger>
			<DialogContentUnstyled
				container={commentsState.container}
				className="flex flex-col justify-center items-center outline-none"
			>
				<ContextMenu>
					<ContextMenuTrigger>
						<img
							src={props.src}
							alt={props.alt}
							className="max-w-4xl max-h-96 object-contain rounded-lg animate-fade-in"
						/>
					</ContextMenuTrigger>
					<ContextMenuContent
						container={commentsState.container}
						style={{ zIndex: 9999 }}
						className="px-2 py-2"
					>
						{props.type &&
							['image/png', 'image/svg+xml'].includes(props.type) && (
							<>
								<ContextMenuItem className="cursor-pointer" onClick={copyImage}>
									Copy Image
								</ContextMenuItem>

								<ContextMenuItem className="cursor-pointer" onClick={saveImage}>
									Save Image
								</ContextMenuItem>

								<div className="w-full h-[1px] bg-input my-2"></div>
							</>
						)}
						<ContextMenuItem className="cursor-pointer" onClick={copyLink}>
							Copy Link
						</ContextMenuItem>
						<ContextMenuItem className="cursor-pointer" onClick={openLink}>
							Open Link
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>

				<a
					href={props.src}
					target="_blank"
					rel="noreferrer"
					className="mt-3 text-white/50 hover:text-white hover:underline transition-all duration-300"
				>
					Open in Browser
				</a>
			</DialogContentUnstyled>
		</Dialog>
	);
}
