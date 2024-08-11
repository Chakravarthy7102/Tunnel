import { Draggable } from '#components/ui/draggable.tsx';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { cn } from '@-/design-system/v1';
import React, { Fragment, type PropsWithChildren } from 'react';

export function ToolbarContainer({
	children,
	context,
}: PropsWithChildren<{ context: PageToolbarContext }>) {
	const state = useContextStore(context);

	const childrenArray = React.Children.toArray(children);
	if (childrenArray.every((child) => !child)) {
		return null;
	}

	return (
		<Draggable
			xPos={window.innerWidth / 2}
			yPos={window.innerHeight - 72}
			className={cn(
				'isolate z-[2147483647] cursor-default animate-opacity fixed rounded-[10px] bg-neutral-600 shadow-toolbar-container-shadow flex-row touch-none',
				state.isToolbarHidden ? 'hidden' : 'flex',
			)}
			id="toolbar-container"
		>
			<div
				className={cn(
					'flex-row',
					'flex items-center justify-between h-full relative p-2',
				)}
			>
				{childrenArray.map((child, index) => {
					if (!child) return null;

					return (
						<Fragment key={index}>
							{index !== 0 && (
								<div className="w-[1px] h-6 bg-[#ffffff10] mx-2 rounded-full">
								</div>
							)}
							{child}
						</Fragment>
					);
				})}
			</div>
		</Draggable>
	);
}
