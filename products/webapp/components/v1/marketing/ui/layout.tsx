import { cn } from '@-/design-system/v1';

export function PageContainer({
	children,
	...props
}: React.HTMLProps<HTMLDivElement>) {
	return (
		<div
			{...props}
			className={cn(
				'flex flex-col w-full container max-w-5xl mx-auto pb-24 sm:pb-0',
				props.className,
			)}
		>
			{children}
		</div>
	);
}

export function BlockContainer({
	children,
	...props
}: React.HTMLProps<HTMLDivElement>) {
	return (
		<div
			{...props}
			className={cn(
				'flex flex-col justify-center items-center w-full py-12 sm:py-24',
				props.className,
			)}
		>
			{children}
		</div>
	);
}
