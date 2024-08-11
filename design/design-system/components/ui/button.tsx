import { cn } from '#utils/style.ts';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { RotateCw } from 'lucide-react';
import * as React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-x-1',
	{
		variants: {
			variant: {
				default:
					'bg-v2-primary-base text-v2-primary-foreground border border-v2-soft-200 shadow-v2-button hover:bg-v2-primary-dark focus-visible:shadow-v2-button-primary-focus',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-v2-neutral-600 text-white border border-v2-soft-200 shadow-v2-button hover:bg-v2-neutral-700 focus-visible:shadow-v2-button-secondary-focus',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
			},
			size: {
				default: 'h-10 px-4 py-2 text-sm',
				xs: 'h-8 px-2 py-0.5 text-xs rounded-md',
				sm: 'h-9 rounded-md px-3 text-sm',
				lg: 'h-11 rounded-md px-8 text-sm',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export interface ButtonProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants>
{
	asChild?: boolean;
	isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			asChild = false,
			isLoading = false,
			children,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{isLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : children}
			</Comp>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
