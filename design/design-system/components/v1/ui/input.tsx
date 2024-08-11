import { cn } from '#utils/style.ts';
import * as React from 'react';
import type { InputProps } from './_murat-input.tsx';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={cn(
				'flex h-9 w-full text-accent-foreground font-light rounded-md border hover:border-blue-500 border-input bg-popover px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = 'Input';

export { Input };
