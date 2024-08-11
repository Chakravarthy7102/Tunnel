import { cn } from '#utils/style.ts';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const linkButtonVariants = cva(
	'flex flex-row items-center gap-x-1 hover:underline focus-visible:underline focus-visible:ring-none focus-visible:outline-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'text-v2-primary-base hover:text-v2-primary-dark',
				secondary: 'text-v2-main-900',
				tertiary:
					'text-v2-sub-500 hover:text-v2-neutral-300 focus-visible:text-v2-main-900',
				danger: 'text-v2-red-base hover:text-v2-red-dark',
			},
			size: {
				xs: 'text-xs',
				sm: 'text-sm',
				md: 'text-base',
				lg: 'text-lg',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	},
);

export interface LinkButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof linkButtonVariants>
{
	asChild?: boolean;
}

const LinkButton = React.forwardRef<HTMLButtonElement, LinkButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(linkButtonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
LinkButton.displayName = 'Button';

export { LinkButton, linkButtonVariants };
