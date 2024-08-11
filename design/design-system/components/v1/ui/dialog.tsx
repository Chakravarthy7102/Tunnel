'use client';

import { cn } from '#utils/style.ts';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from './button.tsx';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({
	container,
	...props
}: Omit<DialogPrimitive.DialogPortalProps, 'container'> & {
	container: HTMLElement | null;
	className?: string;
}) => (
	<DialogPrimitive.Portal
		container={container}
		{...props}
	/>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		style={{
			zIndex: 1000,
		}}
		{...props}
	/>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	Omit<
		React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
		'container'
	> & {
		/* `null` is used when the component is rendered server-side */
		container: HTMLElement | null;
	}
>(({ className, children, container, ...props }, ref) => {
	return (
		<DialogPortal container={container}>
			<DialogOverlay>
				<DialogPrimitive.Content
					ref={ref}
					style={{
						zIndex: 1001,
					}}
					className={cn(
						'flex flex-col isolate pointer-events-auto fixed left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-none bg-popover shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-hidden',
						className,
					)}
					/** @see https://github.com/shadcn-ui/ui/pull/2123 */
					onWheel={(e) => {
						e.stopPropagation();
						const isScrollingDown = e.deltaY > 0;
						if (isScrollingDown) {
							e.currentTarget.dispatchEvent(
								new KeyboardEvent('keydown', { key: 'ArrowDown' }),
							);
						} else {
							e.currentTarget.dispatchEvent(
								new KeyboardEvent('keydown', { key: 'ArrowUp' }),
							);
						}
					}}
					{...props}
				>
					{children}
				</DialogPrimitive.Content>
			</DialogOverlay>
		</DialogPortal>
	);
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-row text-center sm:text-left text-foreground p-4 border-solid border-b border-b-input gap-y-1 gap-x-2 justify-between items-center',
			className,
		)}
		{...props}
	>
		<div className="w-full flex flex-col justify-center items-start gap-y-1">
			{children}
		</div>
		<DialogPrimitive.Close asChild>
			<Button variant="ghost" size="icon" className="min-w-max">
				<X size={14} className="text-muted-foreground" />
			</Button>
		</DialogPrimitive.Close>
	</div>
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse sm:flex-row sm:justify-end p-4 bg-secondary border-solid border-t border-input gap-2',
			className,
		)}
		{...props}
	/>
);

const DialogBody = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'w-full flex flex-col justify-start items-start p-4 max-h-[500px] overflow-y-auto tunnel-track',
			className,
		)}
		{...props}
	/>
);

DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-base font-medium leading-none tracking-tight text-foreground',
			className,
		)}
		{...props}
	/>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
type DialogProps = DialogPrimitive.DialogProps;

const DialogContentUnstyled = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	Omit<
		React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
		'container'
	> & {
		/* `null` is used when the component is rendered server-side */
		container: HTMLElement | null;
	}
>(({ className, children, container, ...props }, ref) => (
	<DialogPortal container={container}>
		<DialogOverlay>
			<DialogPrimitive.Content
				ref={ref}
				style={{
					zIndex: 1001,
				}}
				className={cn(
					'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogOverlay>
	</DialogPortal>
));

export {
	Dialog,
	DialogBody,
	DialogContent,
	DialogContentUnstyled,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
};

export type { DialogProps };
