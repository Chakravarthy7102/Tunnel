'use client';

import { cn } from '#utils/style.ts';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';
import { muratDropdownItemVariants } from './_murat-dropdown.tsx';

const MuratSelect = SelectPrimitive.Root;

const MuratSelectGroup = SelectPrimitive.Group;

const MuratSelectValue = SelectPrimitive.Value;

const MuratSelectTrigger = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Trigger
		ref={ref}
		className={cn(
			'flex h-9 w-full flex-row justify-between items-center rounded-[8px] p-3 text-sm font-normal outline-none border border-solid border-transparent transition-all resize-none',
			'bg-neutral-900 placeholder:text-neutral-500 text-neutral-0 shadow-stroke-input-inline',
			'hover:bg-neutral-700',
			'focus:border-neutral-900 focus:shadow-button-shadow-focus-dropdown',
			'disabled:bg-neutral-900 disabled:text-neutral-600 disabled:placeholder:text-neutral-600 disabled:cursor-not-allowed',
			className,
		)}
		{...props}
	>
		{children}
		<SelectPrimitive.Icon
			asChild
		>
			<ChevronDown size={14} className="text-neutral-400" />
		</SelectPrimitive.Icon>
	</SelectPrimitive.Trigger>
));

MuratSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const MuratSelectContent = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Content>,
	Omit<
		React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
		'container'
	> & {
		container: HTMLElement | null;
	}
>(({ container, className, children, position = 'popper', ...props }, ref) => (
	<SelectPrimitive.Portal container={container}>
		<SelectPrimitive.Content
			ref={ref}
			className={cn(
				'relative z-50 min-w-[8rem] overflow-hidden rounded-[8px] bg-neutral-700 text-neutral-0 shadow-modal-primary data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				position === 'popper' &&
					'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
				className,
			)}
			position={position}
			{...props}
		>
			<SelectPrimitive.Viewport
				className={cn(
					'p-1',
					position === 'popper' &&
						'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
				)}
			>
				{children}
			</SelectPrimitive.Viewport>
		</SelectPrimitive.Content>
	</SelectPrimitive.Portal>
));
MuratSelectContent.displayName = SelectPrimitive.Content.displayName;

const MuratSelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn('px-2 py-1.5 text-sm font-semibold', className)}
		{...props}
	/>
));
MuratSelectLabel.displayName = SelectPrimitive.Label.displayName;

const MuratSelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(muratDropdownItemVariants({
			size: 'small',
			variant: 'default',
			className,
		}))}
		{...props}
	>
		<span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectPrimitive.ItemIndicator>
				<Check size={14} className="text-muratblue-base" />
			</SelectPrimitive.ItemIndicator>
		</span>
		<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
	</SelectPrimitive.Item>
));
MuratSelectItem.displayName = SelectPrimitive.Item.displayName;

export {
	MuratSelect,
	MuratSelectContent,
	MuratSelectGroup,
	MuratSelectItem,
	MuratSelectLabel,
	MuratSelectTrigger,
	MuratSelectValue,
};
