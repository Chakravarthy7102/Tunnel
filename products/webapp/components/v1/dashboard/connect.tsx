'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { FrameworkSelect } from '#components/v1/get-started/framework-select.tsx';
import { frameworkOptions } from '#utils/frameworks.tsx';
import { useState } from 'react';

export function Connect() {
	const [framework, setFramework] = useState<keyof typeof frameworkOptions>(
		'next',
	);

	return (
		<div className="w-full flex flex-col gap-2">
			<div className="flex flex-row w-full justify-end items-center">
				<FrameworkSelect
					framework={framework}
					setFramework={setFramework}
				/>
			</div>

			<div className="flex flex-col justify-center items-center gap-6">
				<DashboardCard
					title="Create your first preview"
					subtitle="Tunnel allows you to create live previews of your localhost for your team to view and collaborate on."
				>
					{frameworkOptions[framework].localInstallation}
				</DashboardCard>
				<DashboardCard
					title="Add Tunnel to your hosted app"
					subtitle="You can also add Tunnel to a hosted app, like a staging environment or branch deployment."
				>
					{frameworkOptions[framework].getHostedInstallation(
						'PROJECT_ID',
						false,
					)}
				</DashboardCard>
			</div>
		</div>
	);
}
