import { cn } from '#utils/style.ts';
import * as React from 'react';
import type { TextareaProps } from './_murat-textarea.tsx';

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => (
		<textarea
			className={cn(
				'flex min-h-[60px] w-full py-2 text-accent-foreground font-light rounded-md border hover:border-blue-500 border-input bg-popover px-3 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Textarea.displayName = 'Textarea';

export { Textarea };
