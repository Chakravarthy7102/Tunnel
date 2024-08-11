'use client';

import { cn } from '#utils/style.ts';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const avatarVariants = cva('relative flex shrink-0 overflow-hidden', {
	variants: {
		variant: {
			rounded: 'rounded-full',
			square: 'rounded-[5px]',
		},
		size: {
			xs: 'w-4 h-4',
			sm: 'w-6 h-6',
			md: 'h-8 w-8',
			lg: 'h-10 w-10',
			xl: 'h-12 w-12',
			'2xl': 'w-24 h-24',
		},
	},
	defaultVariants: {
		variant: 'rounded',
		size: 'md',
	},
});

export interface AvatarProps
	extends
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof avatarVariants>
{}

const Avatar = React.forwardRef<HTMLButtonElement, AvatarProps>(
	({ className, variant, size, ...props }, ref) => (
		<AvatarPrimitive.Root
			ref={ref}
			className={cn(avatarVariants({ variant, size, className }))}
			{...props}
		/>
	),
);

Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn('aspect-square h-full w-full', className)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			'flex h-full w-full items-center justify-center rounded-full bg-muted',
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage, avatarVariants };
