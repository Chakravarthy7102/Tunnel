import { cn } from '#utils/style.ts';
import * as React from 'react';

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement>
{
	hasError?: boolean;
}

const MuratInput = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, hasError, ...props }, ref) => (
		<input
			className={cn(
				'flex h-9 w-full rounded-[8px] p-3 text-sm font-normal outline-none border border-solid border-transparent transition-all resize-none ',
				'bg-neutral-900 placeholder:text-neutral-500 text-neutral-0 shadow-stroke-input-inline',
				'hover:bg-neutral-700',
				'focus:border-neutral-900 focus:shadow-button-shadow-focus-dropdown',
				'disabled:bg-neutral-900 disabled:text-neutral-600 disabled:placeholder:text-neutral-600 disabled:cursor-not-allowed',
				hasError ?
					'!border-muratred-base !shadow-button-focus-error !bg-neutral-900' :
					'',
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
MuratInput.displayName = 'Input';

export { MuratInput };
