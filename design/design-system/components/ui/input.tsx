import { cn } from '#utils/style.ts';
import * as React from 'react';

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement>
{
	hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, hasError, ...props }, ref) => (
		<input
			className={cn(
				'flex h-10 w-full rounded-lg p-3 text-sm font-normal outline-none bg-v2-background shadow-v2-input transition-all resize-none hover:bg-v2-surface-700 focus:hover:bg-v2-background border border-transparent',
				hasError ?
					'!border-v2-danger-500 shadow-v2-input-error !bg-v2-neutral-900 focus:shadow-v2-input-error-focus' :
					'focus:shadow-v2-input-focus',
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = 'Input';

export { Input };
