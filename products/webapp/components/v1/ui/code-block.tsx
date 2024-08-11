'use client';

import { buttonVariants, cn } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { Check, Clipboard } from 'lucide-react';
import { type PropsWithChildren, useEffect, useState } from 'react';

export function CodeBlock({
	children,
	text,
}: PropsWithChildren<{
	text: string;
}>) {
	const [isClicked, setIsClicked] = useState(false);

	useEffect(() => {
		if (isClicked) {
			setTimeout(() => {
				setIsClicked(false);
			}, 1000);
		}
	}, [isClicked]);

	return (
		<button
			className={cn(
				'flex truncate flex-row justify-between items-center',
				'rounded-[5px] border border-solid border-input py-2 px-4 relative w-full font-mono font-light text-sm bg-background/80 hover:border-blue-500 text-accent-foreground',
			)}
			onClick={async () => {
				setIsClicked(true);
				await navigator.clipboard.writeText(text);
				toast.COPY_CLIPBOARD_SUCCESS();
			}}
		>
			{children}
			<div className="absolute right-1 pl-2">
				<CopyButton isClicked={isClicked} text={text} />
			</div>
		</button>
	);
}

export function CopyButton({
	icon,
	isClicked,
}: {
	text: string;
	icon?: React.ReactNode;
	isClicked: boolean;
}) {
	return (
		<div
			className={cn(
				buttonVariants({
					size: 'icon',
					variant: 'ghost',
				}),
			)}
		>
			{isClicked ? <Check color="#22c55e" size={14} /> : (
				icon ?? <Clipboard size={14} />
			)}
		</div>
	);
}
