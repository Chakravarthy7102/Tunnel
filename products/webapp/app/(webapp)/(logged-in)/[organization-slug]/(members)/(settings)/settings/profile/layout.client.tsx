'use client';

import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import type { ReactNode } from 'react';

export default function LayoutClient({ children }: { children: ReactNode }) {
	return (
		<>
			<DashboardContainer>{children}</DashboardContainer>
		</>
	);
}
