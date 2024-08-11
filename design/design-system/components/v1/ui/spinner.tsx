import { cn } from '#utils/style.ts';

export function Spinner({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'animate-spin rounded-full h-4 w-4 border-b-transparent border-r-transparent border-solid border-white border-[2px]',
				className,
				'border-b-transparent border-r-transparent',
			)}
		>
		</div>
	);
}
