import { buttonVariants, cn } from '@-/design-system/v1';
import Link from 'next/link';
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
	const className = cn(
		buttonVariants({
			variant: 'ghost',
			size: 'sm',
			className: 'text-muted-foreground ',
		}),
		isActive && '!bg-accent/60 !text-foreground',
	);

	if (link && href) {
		return (
			<Link
				href={href}
				className={className}
			>
				{children}
			</Link>
		);
	}

	return (
		<button
			className={className}
			{...props}
		>
			{children}
		</button>
	);
}
