import { buttonVariants, cn } from '@-/design-system/v1';
import type { PropsWithChildren } from 'react';

interface NavigationButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>
{
	href?: string;
	isActive?: boolean;
	link?: boolean;
}

export function NavigationButton({
	href,
	children,
	isActive,
	link = true,
	...props
}: PropsWithChildren<NavigationButtonProps>) {
	if (link && href) {
		return (
			<a
				href={href}
				className={cn(
					buttonVariants({
						variant: 'ghost',
						size: 'sm',
						className: 'text-muted-foreground',
					}),
					isActive && '!bg-accent/60 !text-foreground',
				)}
			>
				{children}
			</a>
		);
	}

	return (
		<button
			className={cn(
				buttonVariants({
					variant: 'ghost',
					size: 'sm',
					className: 'text-muted-foreground',
				}),
				isActive && '!bg-accent/60 !text-foreground',
			)}
			{...props}
		>
			{children}
		</button>
	);
}
