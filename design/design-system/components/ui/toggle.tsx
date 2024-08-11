'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '#utils/style.ts';

const toggleVariants = cva(
	'inline-flex items-center gap-1 justify-center rounded-lg text-sm font-medium transition-colors',
	{
		variants: {
			variant: {
				default:
					'data-[state=on]:bg-v2-neutral-600 border border-transparent data-[state=on]:border-v2-soft-200 data-[state=on]:shadow-v2-button-important hover:bg-v2-neutral-700 hover:border-v2-soft-200 data-[state=off]:focus-visible:bg-v2-neutral-700 data-[state=off]:focus-visible:border-v2-soft-200 data-[state=on]:hover:bg-v2-neutral-600 focus-visible:outline-none',
				outline:
					'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
			},
			size: {
				default: 'h-10 px-3',
				sm: 'h-9 px-2.5',
				lg: 'h-11 px-5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	& React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
	& VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({ variant, size, className }))}
		{...props}
	/>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
