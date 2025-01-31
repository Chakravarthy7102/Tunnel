'use client';

import { cn } from '#utils/style.ts';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import * as React from 'react';

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
	React.ElementRef<typeof HoverCardPrimitive.Content>,
	Omit<
		React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>,
		'container'
	> & {
		/* `null` is used when the component is rendered server-side */
		container: HTMLElement | null;
	}
>(
	(
		{ className, container, align = 'center', sideOffset = 4, ...props },
		ref,
	) => (
		<HoverCardPrimitive.Portal container={container}>
			<HoverCardPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'w-64 rounded-md border border-solid border-input bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
					className,
				)}
				style={{
					zIndex: 1001,
				}}
				{...props}
			/>
		</HoverCardPrimitive.Portal>
	),
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardContent, HoverCardTrigger };
