'use client';

import { cn, Form } from '@-/design-system/v1';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

export function PersonalAccountCard({
	title,
	subtitle,
	button,
}: {
	title: string;
	subtitle?: string;
	button?: ReactNode;
}) {
	const form = useForm();

	return (
		<Form {...form}>
			<form
				className={cn(
					'w-full max-w-3xl bg-[#262626] border border-solid rounded-[5px] flex flex-col justify-start items-center shadow-background overflow-hidden shadow-foreground/5 border-input',
				)}
				onSubmit={(e) => e.preventDefault()}
			>
				<div className="flex flex-row justify-center items-center gap-4 w-full px-4 py-4">
					<div className="w-full flex flex-col justify-center items-start">
						<p className="text-base font-medium">{title}</p>
						<p className="text-sm text-muted-foreground">{subtitle}</p>
					</div>

					{button && (
						<div className="w-full flex flex-row justify-end items-center">
							{button}
						</div>
					)}
				</div>
			</form>
		</Form>
	);
}
