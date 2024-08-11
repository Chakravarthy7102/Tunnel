import { cn } from '#utils/style.ts';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { RotateCw } from 'lucide-react';
import * as React from 'react';

const buttonVariants = cva(
	'gap-x-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				none: '',
				default:
					'bg-primary text-primary-foreground shadow hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-outline-border bg-outline-background text-accent-foreground hover:text-foreground hover:bg-input font-normal',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				blue: 'bg-blue-600 hover:bg-blue-600/90 text-secondary-foreground',
				muratblue: cn(
					'border-[0.5px] border-solid',
					'focus:shadow-button-focus-blue',
				),
				muratsecondary: cn(
					'border-[0.5px] border-solid',
					'',
				),
				muratred: cn(),
				input: cn(
					'flex font-normal outline-none border border-solid border-transparent transition-all resize-none ',
					'bg-neutral-900 text-neutral-0 shadow-stroke-input-inline',
					'hover:bg-neutral-700',
					'focus:border-neutral-900 focus:shadow-button-shadow-focus-dropdown',
					'disabled:bg-neutral-900 disabled:text-neutral-600 disabled:placeholder:text-neutral-600 disabled:cursor-not-allowed',
				),
			},
			fill: {
				filled: '',
				stroke: '',
				ghost: '',
			},
			size: {
				none: '',
				muratmd: 'h-10 px-4 font-medium text-sm rounded-[10px]',
				muratsm: 'h-9 px-[14px] font-medim text-sm rounded-[8px]',
				muratxs: 'h-8 px-3 font-medium text-xs rounded-[8px]',
				default: 'h-8 px-3 py-2 gap-x-1.5',
				sm: 'h-8 rounded-md px-3 text-xs',
				xs: 'h-7 px-2 py-1.5 rounded-md',
				lg: 'h-10 rounded-md px-8',
				icon: 'h-6 w-6',
				minimal: 'h-8 rounded-md text-xs',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			fill: 'filled',
		},
		compoundVariants: [
			{
				variant: 'muratblue',
				fill: 'filled',
				className: cn(
					'bg-muratblue-base hover:bg-muratblue-dark disabled:bg-muratblue-darker',
					'text-neutral-0 disabled:text-muratblue-dark',
					'border-[#ffffff10]',
					'shadow-button-primary',
				),
			},
			{
				variant: 'muratblue',
				fill: 'stroke',
				className: cn(
					'bg-surface-700 hover:bg-muratblue-lighter disabled:bg-neutral-900',
					'text-muratblue-base disabled:text-muratblue-light',
					'border-muratblue-base',
					'shadow-button-primary',
				),
			},
			{
				variant: 'muratblue',
				fill: 'ghost',
				className: cn(
					'bg-transparent hover:bg-muratblue-lighter focus:bg-surface-700',
					'text-muratblue-base disabled:text-muratblue-light',
					'border-transparent focus:border-muratblue-base',
				),
			},
			{
				variant: 'muratsecondary',
				fill: 'filled',
				className: cn(
					'bg-neutral-600 hover:bg-neutral-700 focus:bg-neutral-600 disabled:bg-neutral-600',
					'text-neutral-0 disabled:text-sub-500',
					'border-[#ffffff10]',
					'shadow-button-important focus:shadow-button-focus-important',
				),
			},
			{
				variant: 'muratsecondary',
				fill: 'stroke',
				className: cn(
					'bg-neutral-900 hover:bg-neutral-700 focus:bg-neutral-900 disabled:bg-neutral-900',
					'text-neutral-0 disabled:text-neutral-500',
					'border-transparent',
					'shadow-stroke-opacity-white focus:shadow-button-focus-stroke-important',
				),
			},
			{
				variant: 'muratsecondary',
				fill: 'ghost',
				className: cn(
					'bg-transparent hover:bg-neutral-800 focus:bg-neutral-900',
					'text-neutral-0 disabled:text-neutral-500',
					'border-transparent',
					'hover:shadow-stroke-opacity-white focus:shadow-button-focus-stroke-important',
				),
			},
			{
				variant: 'muratred',
				fill: 'filled',
				className: cn(
					'bg-muratred-base hover:bg-muratred-dark focus:bg-muratred-base disabled:bg-muratred-lighter',
					'text-neutral-0 disabled:text-muratred-light',
					'border-[0.5px] border-solid border-[#ffffff10]',
					'shadow-button-primary focus:shadow-button-focus-error',
				),
			},
			{
				variant: 'muratred',
				fill: 'stroke',
				className: cn(
					'bg-surface-700 hover:bg-muratred-lighter focus:bg-surface-700 disabled:bg-neutral-900',
					'text-muratred-base disabled:text-muratred-light',
					'border-[0.5px] border-solid border-muratred-base hover:border-muratred-lighter focus:border-muratred-base disabled:border-muratred-base',
					'shadow-button-primary focus:shadow-button-focus-error',
				),
			},
			{
				variant: 'muratred',
				fill: 'ghost',
				className: cn(
					'bg-transparent hover:bg-muratred-lighter focus:bg-surface-700',
					'text-muratred-base disabled:text-muratred-light',
					'border-[0.5px] border-solid border-transparent focus:border-muratred-base',
					'focus:shadow-button-focus-error',
				),
			},
		],
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
			fill,
			size,
			asChild = false,
			isLoading = false,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button';
		const { disabled, ...otherProps } = props;
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, fill, className }))}
				ref={ref}
				disabled={isLoading || disabled}
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
