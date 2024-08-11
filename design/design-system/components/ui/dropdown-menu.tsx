'use client';

import { cn } from '#utils/style.ts';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import {
	type ComponentPropsWithoutRef,
	type ElementRef,
	forwardRef,
	type HTMLAttributes,
} from 'react';

export const DropdownMenu = {
	Root: RadixDropdownMenu.Root,
	Group: RadixDropdownMenu.Group,
	Portal: RadixDropdownMenu.Portal,
	Sub: RadixDropdownMenu.Sub,
	RadioGroup: RadixDropdownMenu.RadioGroup,
	Trigger: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.Trigger>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.Trigger>
		>(({ className, ...props }, ref) => (
			<RadixDropdownMenu.Trigger
				ref={ref}
				className={cn(
					'focus:outline-0 focus:ring-2 focus:ring-white/15 focus:ring-offset-2  focus:ring-offset-[#18181B]',
					className,
				)}
				{...props}
			/>
		)),
		{ displayName: RadixDropdownMenu.Trigger },
	),
	SubTrigger: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.SubTrigger>,
			& ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger>
			& {
				inset?: boolean;
			}
		>(({ className, inset, children, ...props }, ref) => (
			<RadixDropdownMenu.SubTrigger
				ref={ref}
				className={cn(
					'relative flex gap-x-2 cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-v2-neutral-600 border border-transparent focus:border-v2-soft-200 data-[disabled]:opacity-50 [&>svg]:text-v2-sub-500 [&>svg]:focus:text-v2-main-900',
					inset && 'pl-8',
					className,
				)}
				{...props}
			>
				{children}
				<ChevronRight className="ml-auto" size={16} />
			</RadixDropdownMenu.SubTrigger>
		)),
		{ displayName: RadixDropdownMenu.SubTrigger.displayName },
	),
	SubContent: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.SubContent>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent>
		>(({ className, ...props }, ref) => (
			<RadixDropdownMenu.SubContent
				ref={ref}
				className={cn(
					'z-50 min-w-[8rem] overflow-hidden ml-1 rounded-lg border bg-v2-surface-700 p-1 text-main-900 shadow-v2-modal-primary',
					'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					className,
				)}
				{...props}
			/>
		)),
		{ displayName: RadixDropdownMenu.SubContent.displayName },
	),
	Content: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.Content>,
			Omit<
				ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>,
				'container'
			> & {
				/** `null` is used when the component is rendered server-side */
				container: HTMLElement | null;
			}
		>(({ className, sideOffset = 4, container, ...props }, ref) => (
			<RadixDropdownMenu.Portal container={container}>
				<RadixDropdownMenu.Content
					ref={ref}
					sideOffset={sideOffset}
					className={cn(
						'z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-v2-surface-700 p-1 text-main-900 shadow-v2-modal-primary',
						'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
						className,
					)}
					{...props}
				/>
			</RadixDropdownMenu.Portal>
		)),
		{ displayName: RadixDropdownMenu.Content.displayName },
	),
	Item: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.Item>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
				inset?: boolean;
				danger?: boolean;
			}
		>(({ className, inset, danger, ...props }, ref) => (
			<RadixDropdownMenu.Item
				ref={ref}
				className={cn(
					'relative flex gap-x-2 cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none [&>svg]:text-v2-sub-500 [&>svg]:focus:text-v2-main-900 transition-colors focus:bg-v2-neutral-600 border border-transparent focus:border-v2-soft-200 data-[disabled]:opacity-50',
					inset && 'pl-8',
					danger &&
						'focus:bg-v2-danger-500/15 focus:[&>svg]:text-v2-danger-500 focus:text-v2-danger-500 focus:border-v2-danger-500/15 [&>svg]:focus:text-v2-danger-500',
					className,
				)}
				{...props}
			/>
		)),
		{ displayName: RadixDropdownMenu.Item.displayName },
	),
	CheckboxItem: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
		>(({ className, children, checked, ...props }, ref) => (
			<RadixDropdownMenu.CheckboxItem
				ref={ref}
				className={cn(
					'relative flex gap-x-2 cursor-pointer select-none items-center justify-between rounded-md px-2 py-1.5 text-sm outline-none transition-colors [&>svg]:text-v2-sub-500 [&>svg]:focus:text-v2-main-900 focus:bg-v2-neutral-600 border border-transparent focus:border-v2-soft-200 data-[disabled]:opacity-50',
					className,
				)}
				checked={checked}
				{...props}
			>
				{children}
				<span className="flex h-3.5 w-3.5 items-center justify-center">
					<RadixDropdownMenu.ItemIndicator>
						<Check size={14} />
					</RadixDropdownMenu.ItemIndicator>
				</span>
			</RadixDropdownMenu.CheckboxItem>
		)),
		{ displayName: RadixDropdownMenu.CheckboxItem.displayName },
	),
	RadioItem: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.RadioItem>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem>
		>(({ className, children, ...props }, ref) => (
			<RadixDropdownMenu.RadioItem
				ref={ref}
				className={cn(
					'relative flex gap-x-2 cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors [&>svg]:text-v2-sub-500 [&>svg]:focus:text-v2-main-900 focus:bg-v2-neutral-600 border border-transparent focus:border-v2-soft-200 data-[disabled]:opacity-50',
					className,
				)}
				{...props}
			>
				{children}
			</RadixDropdownMenu.RadioItem>
		)),
		{ displayName: RadixDropdownMenu.RadioItem.displayName },
	),
	Label: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.Label>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
				inset?: boolean;
			}
		>(({ className, inset, ...props }, ref) => (
			<RadixDropdownMenu.Label
				ref={ref}
				className={cn(
					'px-2 py-1.5 text-xs text-v2-soft-400',
					inset && 'pl-8',
					className,
				)}
				{...props}
			/>
		)),
		{ displayName: RadixDropdownMenu.Label.displayName },
	),
	Separator: Object.assign(
		forwardRef<
			ElementRef<typeof RadixDropdownMenu.Separator>,
			ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
		>(({ className, ...props }, ref) => (
			<RadixDropdownMenu.Separator
				ref={ref}
				className={cn('-mx-1 my-1 h-px bg-v2-soft-200', className)}
				{...props}
			/>
		)),
		{ displayName: RadixDropdownMenu.Separator.displayName },
	),
	Shortcut: Object.assign(({
		className,
		...props
	}: HTMLAttributes<HTMLSpanElement>) => (
		<span
			className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
			{...props}
		/>
	), { displayName: 'DropdownMenuShortcut' }),
};
