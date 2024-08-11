'use client';

import type { PropsWithChildren } from 'react';

export function DashboardContainer({ children }: PropsWithChildren) {
	return (
		<div className="flex flex-1 flex-col overflow-auto w-full">
			<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-32 pt-8 justify-start items-center">
				{children}
			</main>
		</div>
	);
}
