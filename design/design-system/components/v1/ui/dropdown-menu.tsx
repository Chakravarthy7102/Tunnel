'use client';

import { cn } from '#utils/style.ts';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';
import * as React from 'react';

const DropdownMenu = RadixDropdownMenu.Root;

const DropdownMenuTrigger = RadixDropdownMenu.Trigger;

const DropdownMenuGroup = RadixDropdownMenu.Group;

const DropdownMenuPortal = RadixDropdownMenu.Portal;

const DropdownMenuSub = RadixDropdownMenu.Sub;

const DropdownMenuRadioGroup = RadixDropdownMenu.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubTrigger> & {
		inset?: boolean;
	}
>(({ className, inset, children, ...props }, ref) => (
	<RadixDropdownMenu.SubTrigger
		ref={ref}
		className={cn(
			'relative flex gap-x-2 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-dropdown data-[disabled]:opacity-50',
			inset && 'pl-8',
			className,
		)}
		{...props}
	>
		{children}
		<ChevronRight className="ml-auto text-muted-foreground" size={14} />
	</RadixDropdownMenu.SubTrigger>
));
DropdownMenuSubTrigger.displayName = RadixDropdownMenu.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.SubContent>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.SubContent>
>(({ className, ...props }, ref) => (
	<RadixDropdownMenu.SubContent
		ref={ref}
		className={cn(
			'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md border-solid border-input',
			'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			className,
		)}
		{...props}
	/>
));
DropdownMenuSubContent.displayName = RadixDropdownMenu.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.Content>,
	Omit<
		React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>,
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
				'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md border-solid border-input',
				'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
				className,
			)}
			{...props}
		/>
	</RadixDropdownMenu.Portal>
));
DropdownMenuContent.displayName = RadixDropdownMenu.Content.displayName;

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.Item>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item> & {
		inset?: boolean;
		danger?: boolean;
	}
>(({ className, inset, danger, ...props }, ref) => (
	<RadixDropdownMenu.Item
		ref={ref}
		className={cn(
			'relative flex gap-x-2 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-dropdown data-[disabled]:opacity-50',
			inset && 'pl-8',
			'[&>svg]:text-foreground/50',
			danger && 'focus:bg-red-500 focus:[&>svg]:text-foreground',
			className,
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = RadixDropdownMenu.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
	<RadixDropdownMenu.CheckboxItem
		ref={ref}
		className={cn(
			'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50',
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<RadixDropdownMenu.ItemIndicator>
				<Check className="h-4 w-4" />
			</RadixDropdownMenu.ItemIndicator>
		</span>
		{children}
	</RadixDropdownMenu.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
	RadixDropdownMenu.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.RadioItem>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.RadioItem>
>(({ className, children, ...props }, ref) => (
	<RadixDropdownMenu.RadioItem
		ref={ref}
		className={cn(
			'relative flex cursor-default select-none items-center gap-1 rounded-sm py-1.5 px-2 text-sm outline-none transition-colors text-muted-foreground data-[state=checked]:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent/70',
			className,
		)}
		{...props}
	>
		{
			/* <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
			<RadixDropdownMenu.ItemIndicator>
				<Check className="h-4 w-4" />
			</RadixDropdownMenu.ItemIndicator>
		</span> */
		}
		{children}
	</RadixDropdownMenu.RadioItem>
));
DropdownMenuRadioItem.displayName = RadixDropdownMenu.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.Label>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<RadixDropdownMenu.Label
		ref={ref}
		className={cn(
			'px-2 py-1.5 text-sm font-semibold',
			inset && 'pl-8',
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = RadixDropdownMenu.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof RadixDropdownMenu.Separator>,
	React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Separator>
>(({ className, ...props }, ref) => (
	<RadixDropdownMenu.Separator
		ref={ref}
		className={cn('-mx-1 my-1 h-px bg-muted', className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = RadixDropdownMenu.Separator.displayName;

const DropdownMenuShortcut = ({
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
	<span
		className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
		{...props}
	/>
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
