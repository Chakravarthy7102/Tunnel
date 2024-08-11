'use client';

import { MuratCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/murat-card.tsx';
import { FrameworkSelect } from '#components/v1/get-started/framework-select.tsx';
import type { StepScreenProps } from '#types';
import { frameworkOptions } from '#utils/frameworks.tsx';
import { Button } from '@-/design-system/v1';
import { useState } from 'react';

export function HostedAppStepScreen({
	onContinue,
	project,
}: StepScreenProps) {
	const [framework, setFramework] = useState<keyof typeof frameworkOptions>(
		'next',
	);

	return (
		<div className="flex flex-col justify-center items-center gap-y-6 w-full">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Add Tunnel to your hosted app
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					You can also add Tunnel to a hosted app, like a staging environment or
					branch deployment.
				</p>
			</div>

			<MuratCard className="p-4 flex flex-col justify-center items-start w-full max-w-2xl gap-y-4">
				<FrameworkSelect framework={framework} setFramework={setFramework} />
				{frameworkOptions[framework].getHostedInstallation(
					project?._id ?? 'PROJECT_ID',
					true,
				)}
				<Button
					variant="muratsecondary"
					size="muratsm"
					className="w-full"
					onClick={onContinue}
				>
					Continue
				</Button>
			</MuratCard>
		</div>
	);
}
