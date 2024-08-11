'use client';

import { cn } from '#utils/style.ts';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';
import { muratDropdownItemVariants } from './_murat-dropdown.tsx';

interface CommandProps
	extends React.ComponentPropsWithoutRef<typeof CommandPrimitive>
{}

const MuratCommand = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	CommandProps
>(({ className, children, ...props }, ref) => {
	return (
		<CommandPrimitive
			ref={ref}
			className={cn(
				'flex h-full w-full flex-col overflow-hidden bg-neutral-700 text-neutral-0',
				className,
			)}
			{...props}
		>
			{children}
		</CommandPrimitive>
	);
});

MuratCommand.displayName = CommandPrimitive.displayName;

const MuratCommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div
		className="flex items-center border-b px-3 py-3 h-9 gap-2 w-full border-solid border-[#ffffff10]"
		cmdk-input-wrapper=""
	>
		<Search className="min-w-max shrink-0 text-neutral-400" size={14} />
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				'flex h-9 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 text-neutral-0 disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	</div>
));

MuratCommandInput.displayName = CommandPrimitive.Input.displayName;

const MuratCommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={cn('-mx-1 h-px bg-[#ffffff10]', className)}
		{...props}
	/>
));
MuratCommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const MuratCommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			muratDropdownItemVariants({
				size: 'small',
				variant: 'default',
			}),
			'relative flex cursor-default select-none outline-none aria-selected:bg-neutral-600 aria-selected:border-[#ffffff10] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
			className,
		)}
		{...props}
	/>
));

MuratCommandItem.displayName = CommandPrimitive.Item.displayName;

export {
	MuratCommand,
	MuratCommandInput,
	MuratCommandItem,
	MuratCommandSeparator,
};
