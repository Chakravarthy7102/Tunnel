import type { PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const Display1 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h1
		className={twMerge(
			'sm:text-7xl text-4xl tracking-tight',
			className,
		)}
	>
		{children}
	</h1>
);

export const Display2 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h2
		className={twMerge(
			'sm:text-6xl text-3xl tracking-tight',
			className,
		)}
	>
		{children}
	</h2>
);

export const Display3 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h3
		className={twMerge(
			'sm:text-5xl text-3xl',
			className,
		)}
	>
		{children}
	</h3>
);

export const Heading1 = ({
	className,
	children,
	...props
}: React.HTMLProps<HTMLHeadingElement>) => (
	<h1
		{...props}
		className={twMerge(
			'sm:text-4xl text-xl',
			className,
		)}
	>
		{children}
	</h1>
);

export const Heading2 = ({
	children,
	className,
	...props
}: React.HTMLProps<HTMLHeadingElement>) => (
	<h2
		{...props}
		className={twMerge(
			'sm:text-3xl text-lg',
			className,
		)}
	>
		{children}
	</h2>
);

export const Heading3 = ({
	children,
	className,
	...props
}: React.HTMLProps<HTMLHeadingElement>) => (
	<h3
		{...props}
		className={twMerge(
			'sm:text-2xl text-base',
			className,
		)}
	>
		{children}
	</h3>
);

export const Heading4 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h4 className={twMerge('sm:text-xl text-lg', className)}>
		{children}
	</h4>
);

export const Heading5 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h5 className={twMerge('sm:text-lg text-xs', className)}>
		{children}
	</h5>
);

export const Heading6 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<h6
		className={twMerge(
			'sm:text-base text-xs',
			className,
		)}
	>
		{children}
	</h6>
);

export const Paragraph1 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<p className={twMerge('sm:text-2xl text-lg', className)}>
		{children}
	</p>
);

export const Paragraph2 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<p className={twMerge('sm:text-xl text-base', className)}>
		{children}
	</p>
);

export const Paragraph3 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<p className={twMerge('sm:text-base text-sm', className)}>
		{children}
	</p>
);

export const Paragraph4 = ({
	children,
	className,
}: PropsWithChildren<{
	className?: string;
}>) => (
	<p className={twMerge('sm:text-sm text-xs', className)}>
		{children}
	</p>
);
