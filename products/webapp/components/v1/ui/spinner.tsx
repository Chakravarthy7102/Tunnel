'use client';

import { cn } from '@-/design-system/v1';

export function Spinner({
	color = 'border-background',
	buttonType,
	size = 16,
}: {
	color?: string;
	size?: number;
	buttonType?: 'primary' | 'secondary' | 'danger' | 'outline';
}) {
	return (
		<div
			style={{
				height: size,
				width: size,
			}}
			className={cn(
				`animate-spin rounded-full !border-b-transparent !border-r-transparent border-[2px]`,
				{
					'border-background': buttonType && buttonType === 'primary',
				},
				{
					'border-foreground': buttonType && buttonType !== 'primary',
				},
				{
					color: !buttonType && color,
				},
			)}
		>
		</div>
	);
}
