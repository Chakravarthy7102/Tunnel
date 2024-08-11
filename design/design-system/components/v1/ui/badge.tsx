import { cn } from '#utils/style.ts';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const badgeVariants = cva(
	'inline-flex items-center border rounded-full transition-colors',
	{
		variants: {
			variant: {
				default: 'bg-popover border-input text-foreground shadow',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground',
				orange: 'bg-brand-orange text-background',
				green: 'bg-brand-green text-background',
				salmon: 'bg-brand-salmon text-background',
				blue: 'bg-brand-blue text-background',
				opp: 'bg-foreground text-background shadow',
				'v2-default': 'bg-v2-weak-100 border-v2-soft-200 text-v2-soft-400',
			},
			size: {
				xs: 'px-2 text-[10px] font-medium',
				md: 'h-8 px-3 text-xs font-medium gap-x-1.5',
				sm: 'h-6 px-2 text-[12px] font-medium gap-x-1.5',
			},
		},

		defaultVariants: {
			variant: 'default',
			size: 'xs',
		},
	},
);

export interface BadgeProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants>
{}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(badgeVariants({ variant, size }), className)}
				{...props}
			/>
		);
	},
);

export { Badge, badgeVariants };
