'use client';

import { useDocumentBody } from '#utils/document.ts';
import {
	Button,
	type ButtonProps,
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@-/design-system/v1';
import { useState } from 'react';
import { Connect } from './dashboard/connect.tsx';

export function CreateTunnelButton({ ...props }: ButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const documentBody = useDocumentBody();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button
					{...props}
					style={{
						minWidth: 'max-content',
					}}
				/>
			</DialogTrigger>
			<DialogContent container={documentBody} className="w-[800px] isolate">
				<DialogHeader>
					<DialogTitle>Get started</DialogTitle>
				</DialogHeader>
				<DialogBody className="flex max-h-[400px] overflow-y-scroll isolate scrollbar-thumb-input scrollbar-track-outline-input tunnel-track">
					<Connect />
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
