'use client';

import { cn } from '#utils/style.ts';
import * as LogoPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const logoVariants = cva(
	'relative flex shrink-0 overflow-hidden border border-white/10',
	{
		variants: {
			size: {
				xs: 'h-6 w-6 rounded-[5px]',
				md: 'h-10 w-10 rounded-[10px]',
			},
		},
		defaultVariants: {
			size: 'md',
		},
	},
);

export interface LogoProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof logoVariants>
{}

const Logo = React.forwardRef<HTMLButtonElement, LogoProps>(
	({ className, size, ...props }, ref) => (
		<LogoPrimitive.Root
			ref={ref}
			className={cn('relative', logoVariants({ size, className }))}
			{...props}
		/>
	),
);

Logo.displayName = LogoPrimitive.Root.displayName;

const LogoImage = React.forwardRef<
	React.ElementRef<typeof LogoPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof LogoPrimitive.Image>
>(({ className, ...props }, ref) => (
	<LogoPrimitive.Image
		ref={ref}
		className={cn(
			'aspect-square h-full w-full',
			className,
		)}
		{...props}
	/>
));
LogoImage.displayName = LogoPrimitive.Image.displayName;

const LogoFallback = React.forwardRef<
	React.ElementRef<typeof LogoPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof LogoPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<LogoPrimitive.Fallback
		ref={ref}
		className={cn(
			'flex h-full w-full items-center justify-center bg-muted',
			className,
		)}
		{...props}
	/>
));
LogoFallback.displayName = LogoPrimitive.Fallback.displayName;

export { Logo, LogoFallback, LogoImage, logoVariants };
