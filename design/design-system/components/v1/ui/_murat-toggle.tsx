'use client';

import { cn } from '#utils/style.ts';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

const Toggle = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			'peer inline-flex h-[16px] w-[28px] shrink-0 cursor-pointer items-center rounded-full transition-colors border border-transparent border-solid',
			'data-[state=unchecked]:bg-neutral-500 data-[state=unchecked]:hover:bg-neutral-400 data-[state=unchecked]:active:bg-neutral-400 data-[state=unchecked]:disabled:bg-neutral-600',
			'data-[state=checked]:bg-muratblue-base data-[state=checked]:disabled:bg-muratblue-lighter',
			'border-[#ffffff10]',
			'data-[state=unchecked]:focus-visible:shadow-button-shadow-focus-dropdown',
			'data-[state=checked]:focus-visible:shadow-button-focus-blue',
			'focus-visible:outline-none',
			'disabled:cursor-not-allowed',
			className,
		)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				'flex justify-center items-center pointer-events-none h-3 w-3 rounded-full transition-transform data-[state=checked]:translate-x-[13px] data-[state=unchecked]:translate-x-[1px]',
				'bg-neutral-0 border-neutral-0',
				// 'shadow-radio-checkbox-shadow-inner-active',
				props.disabled && 'opacity-20',
			)}
		>
			{props.checked !== undefined && (
				<span
					className={cn(
						'h-1 w-1 border border-solid border-transparent rounded-full',
						props.checked ?
							'bg-muratblue-base' :
							'bg-neutral-200',
						props.checked ?
							'border-[#ffffff10]' :
							'border-neutral-100',
						props.disabled && 'bg-neutral-200 border-neutral-100',
					)}
				/>
			)}
		</SwitchPrimitives.Thumb>
	</SwitchPrimitives.Root>
));

Toggle.displayName = SwitchPrimitives.Root.displayName;

export { Toggle };
