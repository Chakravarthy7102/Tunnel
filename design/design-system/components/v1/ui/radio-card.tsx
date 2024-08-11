'use client';

import { cn } from '#utils/style.ts';
import { Radio } from './radio.tsx';

export function RadioCard(
	{
		isSelected,
		isDisabled,
		onSelect,
		children,
		className,
	}: {
		isSelected: boolean;
		isDisabled?: boolean;
		onSelect: () => void;
		children?: React.ReactNode;
		className?: string;
	},
) {
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			onSelect();
		}
	};

	return (
		<div
			tabIndex={isDisabled ? -1 : 0}
			onKeyDown={handleKeyDown}
			onClick={onSelect}
			role="button"
			aria-pressed={isSelected}
			aria-disabled={isDisabled}
			className={cn(
				'flex flex-row justify-start items-start p-4 rounded-[10px] border border-solid border-transparent transition-all gap-x-[14px]',
				'bg-neutral-700 hover:bg-neutral-800 disabled:bg-neutral-700',
				'shadow-stroke-opacity-white',
				isSelected &&
					'border-muratblue-base shadow-button-focus-blue bg-neutral-900 hover:bg-neutral-900',
				className,
			)}
		>
			<div
				className={cn('w-full', isDisabled && 'opacity-20')}
			>
				{children}
			</div>

			<div className="min-w-max">
				<Radio
					isSelected={isSelected}
					isDisabled={isDisabled}
					onSelect={onSelect}
				/>
			</div>
		</div>
	);
}

export function RadioCardTitle({ children }: { children: React.ReactNode }) {
	return <p className="text-sm text-neutral-0 font-medium">{children}</p>;
}

export function RadioCardDescription(
	{ children }: { children: React.ReactNode },
) {
	return <p className="text-xs text-neutral-400 font-normal">{children}</p>;
}
