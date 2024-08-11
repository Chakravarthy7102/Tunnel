'use client';

import { cn, Form } from '@-/design-system/v1';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

export function DashboardCard({
	title,
	subtitle,
	children,
	button,
	toggle,
	isDanger = false,
	isPadded = true,
	icon,
}: {
	title: string;
	subtitle?: string;
	children?: ReactNode;
	button?: ReactNode;
	toggle?: ReactNode;
	isDanger?: boolean;
	isPadded?: boolean;
	icon?: ReactNode;
}) {
	const form = useForm();

	return (
		<Form {...form}>
			<form
				className={cn(
					isDanger ?
						'shadow-red-500/25 border-red-500/50' :
						'shadow-foreground/5 border-input',
					'w-full max-w-3xl bg-[#262626] border border-solid rounded-[5px] flex flex-col justify-start items-center shadow-background overflow-hidden',
				)}
				onSubmit={(e) => e.preventDefault()}
			>
				<div className="flex flex-row justify-center items-center gap-4 w-full px-4 py-4 border-b border-solid border-input last:border-none">
					{icon}
					<div className="w-full flex flex-col justify-center items-start">
						<p className="text-base font-medium">{title}</p>
						<p className="text-sm text-muted-foreground">{subtitle}</p>
					</div>
					{toggle}
				</div>

				{children && (
					<div
						className={cn(
							'w-full flex flex-col justify-start items-start relative',
							button && 'border-b',
							'border-solid border-input',
							isPadded && 'px-4 py-4',
						)}
					>
						{children}
					</div>
				)}

				{button && (
					<div className="w-full flex flex-row justify-end items-center h-16 bg-secondary px-4 rounded-b-[5px]">
						{button}
					</div>
				)}
			</form>
		</Form>
	);
}

export function Card({
	children,
	button,
	isPadded = true,
	hasMaxWidth = true,
	className,
}: {
	children: React.ReactNode;
	button?: React.ReactNode;
	hasMaxWidth?: boolean;
	isPadded?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				'w-full bg-[#262626] border border-solid rounded-[5px] flex flex-col justify-start items-center shadow-background border-input',
				hasMaxWidth && 'max-w-lg',
				className,
			)}
		>
			<div
				className={cn(
					'w-full flex flex-col justify-start items-start',
					button && 'border-b',
					'border-solid border-input',
					isPadded && 'px-4 py-4',
				)}
			>
				{children}
			</div>

			{button && (
				<div className="w-full flex flex-row justify-end items-center h-16 bg-secondary px-4 rounded-b-[5px]">
					{button}
				</div>
			)}
		</div>
	);
}

export function SubCard({ children }: { children: ReactNode }) {
	return (
		<div className="w-full p-4 flex flex-col justify-center items-center">
			<div className="bg-[#323232] w-full flex flex-col justify-center items-center rounded-sm">
				{children}
			</div>
		</div>
	);
}
