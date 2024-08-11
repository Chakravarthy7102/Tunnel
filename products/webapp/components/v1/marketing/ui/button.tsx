import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { RotateCw } from 'lucide-react';
import * as React from 'react';

import { cn } from '@-/design-system/v1';

const buttonVariants = cva(
	'gap-x-1 inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost:
					'bg-transparent text-secondary-foreground shadow-none hover:bg-secondary/90',
				link:
					'text-secondary-foreground shadow-none hover:text-secondary-foreground/90 hover:underline',
			},
			size: {
				sm: 'h-8 px-3 rounded-md text-sm font-normal',
				default: 'h-10 px-3 rounded-md font-normal',
				icon: 'sm:h-8 sm:w-8 w-6 h-6 rounded-md',
				lg: 'sm:h-12 h-10 px-3 sm:px-4 rounded-md text-sm sm:text-lg',
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
		{ className, variant, size, asChild = false, isLoading = false, ...props },
		ref,
	) => {
		const Comp = asChild ? Slot : 'button';
		const { disabled, ...otherProps } = props;
		return (
			<Comp
				className={cn(
					buttonVariants({ size, variant, className }),
				)}
				ref={ref}
				disabled={disabled ?? isLoading}
				{...otherProps}
			>
				{isLoading ? <RotateCw className="h-4 w-4 animate-spin" /> : (
					props.children
				)}
			</Comp>
		);
	},
);
Button.displayName = 'Button';

export { Button, buttonVariants };
