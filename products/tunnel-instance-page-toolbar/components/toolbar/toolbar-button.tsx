import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import {
	cn,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@-/design-system/v1';
import { forwardRef } from 'react';

export const ToolbarButton = forwardRef<
	HTMLButtonElement,
	{
		icon: React.ReactNode;
		tooltipName: string;
		onClick?: () => void;
		context: PageToolbarContext;
		isSelected: boolean;
		className?: string;
		disabled?: boolean;
	}
>((
	{ icon, onClick, tooltipName, context, isSelected, className, disabled },
	ref,
) => {
	const state = useContextStore(context);

	return (
		<TooltipProvider>
			<Tooltip delayDuration={200}>
				<TooltipTrigger asChild>
					<button
						ref={ref}
						onClick={onClick}
						className={cn(
							'flex flex-row justify-center transition-all border-solid border-[0.5px] border-transparent items-center min-h-[36px] min-w-[36px] h-9 w-9 rounded-[8px] text-neutral-0 text-sm',
							'hover:bg-[#ffffff10] hover:shadow-button-important',
							'focus:shadow-button-focus-important',
							'disabled:text-neutral-500 disabled:shadow-none disabled:bg-transparent disabled:border-transparent',
							isSelected &&
								'border-[#ffffff10] bg-[#ffffff10] !shadow-button-important',
							className,
						)}
						disabled={disabled ?? false}
					>
						{icon}
					</button>
				</TooltipTrigger>
				{!disabled && (
					<TooltipContent
						sideOffset={16}
						side={state.toolbar.pos === 'top-center' ?
							'bottom' :
							state.toolbar.pos === 'bottom-center' ?
							'top' :
							state.toolbar.pos === 'center-left' ?
							'right' :
							'left'}
					>
						<p className="text-sm font-medium">{tooltipName}</p>
					</TooltipContent>
				)}
			</Tooltip>
		</TooltipProvider>
	);
});
