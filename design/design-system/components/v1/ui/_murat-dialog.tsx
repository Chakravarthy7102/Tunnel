'use client';

import { cn } from '#utils/style.ts';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { Button } from './button.tsx';

const MuratDialog = DialogPrimitive.Root;

const MuratDialogTrigger = DialogPrimitive.Trigger;

const MuratDialogPortal = ({
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
MuratDialogPortal.displayName = DialogPrimitive.Portal.displayName;

const MuratDialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 bg-[#ffffff08] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
			className,
		)}
		style={{
			zIndex: 1000,
		}}
		{...props}
	/>
));
MuratDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const MuratDialogContent = React.forwardRef<
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
		<MuratDialogPortal container={container}>
			<MuratDialogOverlay>
				<DialogPrimitive.Content
					ref={ref}
					style={{
						zIndex: 1001,
					}}
					className={cn(
						'flex flex-col isolate pointer-events-auto fixed left-[50%] top-[50%] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-none bg-neutral-700 shadow-modal-primary duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-[10px] overflow-hidden',
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
			</MuratDialogOverlay>
		</MuratDialogPortal>
	);
});
MuratDialogContent.displayName = DialogPrimitive.Content.displayName;

const MuratDialogHeader = ({
	className,
	children,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-row text-left text-neutral-0 p-4 border-solid border-b-[0.5px] border-b-[#ffffff10] gap-y-1 gap-x-2 justify-between items-start bg-neutral-600',
			className,
		)}
		{...props}
	>
		<div className="flex flex-col justify-center items-start gap-y-1">
			{children}
		</div>
		<DialogPrimitive.Close asChild>
			<Button
				variant="muratsecondary"
				fill="stroke"
				size="icon"
				className="min-w-max !p-0 !h-6 !w-6 text-neutral-400"
			>
				<X size={12} />
			</Button>
		</DialogPrimitive.Close>
	</div>
);
MuratDialogHeader.displayName = 'DialogHeader';

const MuratDialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-row justify-center sm:justify-end px-5 py-4 bg-neutral-600 border-solid border-t-[0.5px] border-[#ffffff10] gap-3',
			className,
		)}
		{...props}
	/>
);

const MuratDialogBody = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'w-full flex flex-col justify-start items-start p-5 max-h-[500px] overflow-y-auto tunnel-track',
			className,
		)}
		{...props}
	/>
);

MuratDialogFooter.displayName = 'DialogFooter';

const MuratDialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-base font-medium text-neutral-0',
			className,
		)}
		{...props}
	/>
));
MuratDialogTitle.displayName = DialogPrimitive.Title.displayName;

const MuratDialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-neutral-400 font-normal', className)}
		{...props}
	/>
));
MuratDialogDescription.displayName = DialogPrimitive.Description.displayName;
type MuratDialogProps = DialogPrimitive.DialogProps;

export {
	MuratDialog,
	MuratDialogBody,
	MuratDialogContent,
	MuratDialogDescription,
	MuratDialogFooter,
	MuratDialogHeader,
	MuratDialogTitle,
	MuratDialogTrigger,
};

export type { MuratDialogProps };
