'use client';

import { cn } from '#utils/style.ts';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const { PopoverAnchor } = PopoverPrimitive;

export interface PopoverContentProps extends
	Omit<
		React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
		'container'
	>
{
	/* `null` is used when the component is rendered server-side */
	container: HTMLElement | null;
	align?: 'start' | 'center' | 'end';
	sideOffset?: number;
}

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(
	(
		{ className, align = 'center', container, sideOffset = 4, ...props },
		ref,
	) => (
		<PopoverPrimitive.Portal container={container}>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				style={{
					zIndex: 1001,
				}}
				className={cn(
					'w-72 rounded-md border border-solid border-input bg-popover p-2 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	),
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const MuratPopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	PopoverContentProps
>(
	(
		{ className, align = 'center', container, sideOffset = 4, ...props },
		ref,
	) => (
		<PopoverPrimitive.Portal container={container}>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				style={{
					zIndex: 1001,
				}}
				className={cn(
					'w-72 rounded-[8px] bg-neutral-700 overflow-hidden p-1 text-neutral-0 shadow-modal-primary outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	),
);
MuratPopoverContent.displayName = PopoverPrimitive.Content.displayName;

export {
	MuratPopoverContent,
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
};
