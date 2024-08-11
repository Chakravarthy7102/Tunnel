import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { select, updateDoc } from '@-/client-doc';
import {
	MuratDialog,
	MuratDialogBody,
	MuratDialogContent,
	MuratDialogHeader,
	MuratDialogTitle,
	RadioCardDescription,
	RadioCardTitle,
	Toggle,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useState } from 'react';

export function SettingsDialog({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);
	const { webappTrpc } = getWebappTrpc({ context });

	const project = select(
		state,
		'Project',
		state.projectId,
	);

	const [isSessionRecordingEnabled, setIsSessionRecordingEnabled] = useState(
		project.isSessionRecordingEnabled,
	);
	const [isAutoScreenshotEnabled, setIsAutoScreenshotEnabled] = useState(
		project.isAutoScreenshotEnabled,
	);

	const shadowRootElement = useShadowRootElement();

	return (
		<MuratDialog
			open={state.isSettingsDialogOpen ?? false}
			onOpenChange={(open) => {
				context.store.setState({ isSettingsDialogOpen: open });
			}}
		>
			<MuratDialogContent
				container={shadowRootElement}
				className="w-full flex flex-col"
				onPointerDown={(e) => e.stopPropagation()}
			>
				<MuratDialogHeader>
					<MuratDialogTitle>Settings</MuratDialogTitle>
				</MuratDialogHeader>
				<MuratDialogBody>
					<div className="flex flex-row justify-between items-center gap-x-2 w-full">
						<div className="flex flex-col justify-center items-start gap-1">
							<RadioCardTitle>
								Enable session recording
							</RadioCardTitle>
							<RadioCardDescription>
								Session recordings may cause performance issues in large
								applications.
							</RadioCardDescription>
						</div>
						<Toggle
							checked={isSessionRecordingEnabled}
							onCheckedChange={async () => {
								setIsSessionRecordingEnabled(!isSessionRecordingEnabled);
								const result = await webappTrpc.project.update.mutate({
									project: {
										id: project._id,
									},
									actor: {
										type: 'User',
										data: {
											id: state.actor.data.id,
										},
									},
									updates: {
										isSessionRecordingEnabled: !isSessionRecordingEnabled,
									},
								});

								if (result.isErr()) {
									toast.procedureError(result);
								} else {
									context.store.setState(updateDoc.action(
										'Project',
										state.projectId,
										(project) => ({
											...project,
											isSessionRecordingEnabled: !isSessionRecordingEnabled,
										}),
									));
									toast.PROJECT_UPDATE_SUCCESS();
								}
							}}
						/>
					</div>
					<div className="flex flex-row justify-between items-center gap-x-2 w-full mt-2">
						<div className="flex flex-col justify-center items-start gap-1">
							<RadioCardTitle>
								Enable auto-screenshot
							</RadioCardTitle>
							<RadioCardDescription>
								Automatically take a screenshot of the webpage when leaving a
								comment
							</RadioCardDescription>
						</div>
						<Toggle
							checked={isAutoScreenshotEnabled}
							onCheckedChange={async () => {
								setIsAutoScreenshotEnabled(!isAutoScreenshotEnabled);
								const result = await webappTrpc.project.update.mutate({
									project: {
										id: project._id,
									},
									actor: {
										type: 'User',
										data: {
											id: state.actor.data.id,
										},
									},
									updates: {
										isAutoScreenshotEnabled: !isAutoScreenshotEnabled,
									},
								});

								if (result.isErr()) {
									toast.procedureError(result);
								} else {
									context.store.setState(updateDoc.action(
										'Project',
										state.projectId,
										(project) => ({
											...project,
											isAutoScreenshotEnabled: !isAutoScreenshotEnabled,
										}),
									));
									toast.PROJECT_UPDATE_SUCCESS();
								}
							}}
						/>
					</div>
				</MuratDialogBody>
			</MuratDialogContent>
		</MuratDialog>
	);
}
