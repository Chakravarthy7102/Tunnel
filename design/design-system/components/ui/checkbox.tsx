'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '#utils/style.ts';

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'peer h-4 w-4 shrink-0 rounded-sm border-2 border-[#515154] bg-v2-weak-100 focus-visible:border-[#375DFB] shadow-[0px_2px_2px_0px_#1B1C1D1F] ring-offset-v2-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#375DFB]/65 focus-visible:ring-offset-2 focus-visible:bg-[#1E1E21] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-v2-primary-base data-[state=checked]:border-none data-[state=checked]:text-white data-[state=checked]:focus-visible:bg-v2-primary-base transition-colors',
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn('flex items-center justify-center text-current')}
		>
			<Check className="h-3 w-3" />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
