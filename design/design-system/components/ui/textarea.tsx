import * as React from 'react';

import { cn } from '#utils/style.ts';

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement>
{
	hasError?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, hasError = false, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'flex min-h-[80px] w-full rounded-lg text-sm font-normal p-3 outline-none bg-v2-background shadow-v2-input-inline transition-all resize-none placeholder:text-v2-neutral-500 hover:bg-v2-surface-700 focus:hover:bg-v2-background border border-transparent focus:border-v2-background disabled:cursor-not-allowed disabled:opacity-50',
					hasError ?
						'!border-v2-danger-500 ring-2 ring-v2-danger-500/25 ring-offset-2 ring-offset-v2-neutral-900 !bg-v2-neutral-900 focus:ring-v2-danger-500/50' :
						'focus:shadow-v2-dropdown-focus',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = 'Textarea';

export { Textarea };
