import { cn, Tunnel } from '@-/design-system';
import Link from 'next/link';
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	showDisclaimer?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, children, showDisclaimer = false, title, ...props }, ref) => {
		return (
			<>
				<div
					ref={ref}
					className={cn(
						'flex flex-col md:justify-start justify-center items-center w-full max-w-[488px] p-12 rounded-xl bg-v2-surface-700 shadow-v2-card gap-y-6',
						className,
					)}
					{...props}
				>
					<Logo />
					<Title>{title}</Title>
					{children}
				</div>
				{showDisclaimer && (
					<p className="text-xs text-v2-soft-400 mt-4 max-w-[488px] px-12 text-center">
						By proceeding you acknowledge that you have read, understood, and
						agree to our{' '}
						<Link
							href="/terms-of-service"
							className="font-semibold hover:underline"
						>
							Terms and Conditions
						</Link>{' '}
						and{' '}
						<Link
							href="/privacy-policy"
							className="font-semibold hover:underline"
						>
							Privacy Policy
						</Link>
					</p>
				)}
			</>
		);
	},
);

const Logo = () => {
	return (
		<div className="w-10 h-10 flex items-center justify-center bg-v2-neutral-600 border border-v2-soft-200 rounded-lg">
			<Tunnel className="w-5 h-5" />
		</div>
	);
};

const Title = ({ children }: { children: React.ReactNode }) => {
	return (
		<h1 className="text-2xl font-medium text-center">
			{children}
		</h1>
	);
};
