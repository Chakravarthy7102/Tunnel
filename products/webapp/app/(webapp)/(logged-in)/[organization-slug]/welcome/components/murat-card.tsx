import { cn } from '@-/design-system/v1';

export function MuratCard({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'bg-neutral-700 rounded-[10px] shadow-modal-primary',
				className,
			)}
		>
			{children}
		</div>
	);
}
