import { cn } from '#utils/style.ts';

export function Radio({
	isSelected,
	isDisabled,
	onSelect,
}: {
	isSelected: boolean;
	isDisabled?: boolean;
	onSelect: () => void;
	isLoading?: boolean;
}) {
	return (
		<button
			disabled={isDisabled}
			onClick={onSelect}
			className={cn(
				'w-4 h-4 flex justify-center items-center border-solid border-[0.5px] border-transparent rounded-full transition-all',
				!isSelected ?
					'bg-neutral-500 hover:bg-neutral-400 active:bg-muratblue-base disabled:bg-neutral-600' :
					'bg-muratblue-base hover:bg-muratblue-dark active:bg-muratblue-base disabled:bg-neutral-600',
				!isSelected ?
					'active:shadow-button-focus-blue disabled:shadow-none' :
					'active:shadow-button-focus-blue shadow-radio-checkbox-shadow-active-bg disabled:shadow-none',
			)}
		>
			{!isDisabled && !isSelected &&
				(
					<div
						className={cn(
							'h-[13px] w-[13px] rounded-full transition-all',
							'bg-neutral-900',
							'shadow-radio-checkbox-shadow-default',
						)}
					/>
				)}
			{isSelected && (
				<div
					className={cn(
						'h-2 w-2 rounded-full transition-all border-[0.5px] border-transparent border-solid',
						isDisabled ?
							'bg-neutral-900 border-neutral-900/10' :
							'bg-neutral-0',
						isDisabled ?
							'shadow-radio-checkbox-shadow-inner-disabled' :
							'shadow-radio-checkbox-shadow-inner-active',
					)}
				>
				</div>
			)}
		</button>
	);
}
