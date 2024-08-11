'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import { Button, Input, Switch } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useState } from 'react';

export function ProjectSettingsCard({
	actorUser,
	project,
	setProject,
}: {
	actorUser: ServerDoc<typeof User_$profileData>;
	project: ServerDoc<typeof Project_$dashboardPageData>;
	setProject: (
		project: ServerDoc<typeof Project_$dashboardPageData>,
	) => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState<string>(project.name);
	const [isSessionRecordingEnabled, setIsSessionRecordingEnabled] = useState<
		boolean
	>(project.isSessionRecordingEnabled);
	const [isAutoScreenshotEnabled, setIsAutoScreenshotEnabled] = useState<
		boolean
	>(project.isAutoScreenshotEnabled);

	const updateProject = trpc.project.update.useMutation();

	return (
		<DashboardCard
			title="Project settings"
			subtitle="Edit your project profile and settings"
			button={
				<Button
					onClick={async () => {
						setIsLoading(true);
						const result = await updateProject.mutateAsync(
							{
								project: {
									id: project._id,
								},
								actor: { type: 'User', data: { id: actorUser._id } },
								updates: {
									name,
									isSessionRecordingEnabled,
									isAutoScreenshotEnabled,
								},
							},
						);
						setIsLoading(false);
						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						setProject({ ...project, name });
						toast.PROJECT_UPDATE_SUCCESS();
					}}
					isLoading={isLoading}
				>
					Save
				</Button>
			}
		>
			<div className="flex flex-col justify-center items-start w-full gap-4">
				<div className="flex flex-col justify-start items-start w-full">
					<label className="w-full">
						<div className="text-sm text-muted-foreground mb-1">
							Project Name
						</div>
						<Input
							onChange={(e) => setName(e.target.value.slice(0, 32))}
							value={name}
						/>
					</label>
				</div>
				<div className="h-[1px] w-full bg-input">
				</div>
				<div className="flex flex-row justify-between items-center gap-x-4 w-full">
					<div className="flex flex-col justify-center items-start">
						<p className="text-sm text-foreground">
							Enable session recording
						</p>
						<p className="text-sm text-muted-foreground">
							Session recordings may cause performance issues in large
							applications.
						</p>
					</div>

					<Switch
						checked={isSessionRecordingEnabled}
						onCheckedChange={() => {
							setIsSessionRecordingEnabled(!isSessionRecordingEnabled);
						}}
					/>
				</div>
				<div className="flex flex-row justify-between items-center gap-x-4 mt-2 w-full">
					<div className="flex flex-col justify-center items-start">
						<p className="text-sm text-foreground">
							Enable auto-screenshot
						</p>
						<p className="text-sm text-muted-foreground">
							Automatically take a screenshot of the webpage when leaving a
							comment
						</p>
					</div>

					<Switch
						checked={isAutoScreenshotEnabled}
						onCheckedChange={() => {
							setIsAutoScreenshotEnabled(!isAutoScreenshotEnabled);
						}}
					/>
				</div>
			</div>
		</DashboardCard>
	);
}
