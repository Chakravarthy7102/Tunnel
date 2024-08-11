import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { select, updateDoc } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectLivePreview_$createdByUserData,
} from '@-/database/selections';
import {
	Button,
	MuratDialog,
	MuratDialogContent,
	MuratDialogHeader,
	MuratDialogTitle,
	RadioCard,
	RadioCardDescription,
	RadioCardTitle,
} from '@-/design-system/v1';
import { logger } from '@-/logger';
import { toast } from '@-/tunnel-error';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { Check, Clipboard, Link } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ShareDialog({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProjectLivePreview: true;
	}>;
}) {
	const state = useContextStore(context);
	const { webappTrpc } = getWebappTrpc({ context });
	const [isCopyTriggered, setIsCopyTriggered] = useState(false);
	const [currentLoadingPermission, setCurrentLoadingPermission] = useState<
		string | null
	>(null);
	const projectLivePreview = select(
		state,
		'ProjectLivePreview',
		state.projectLivePreviewId,
		getInclude(ProjectLivePreview_$createdByUserData),
	);

	const [viewPermission, setViewPermission] = useState<string>(
		projectLivePreview.viewPermission,
	);

	useEffect(() => {
		if (isCopyTriggered) {
			const timeout = setTimeout(() => {
				setIsCopyTriggered(false);
			}, 2000);

			return () => {
				clearTimeout(timeout);
			};
		}
	}, [isCopyTriggered]);

	const shadowRootElement = useShadowRootElement();

	return (
		<MuratDialog
			open={state.isShareDialogOpen}
			onOpenChange={(open) => {
				context.store.setState({ isShareDialogOpen: open });
			}}
		>
			<MuratDialogContent
				container={shadowRootElement}
				className="w-full flex flex-col"
				onPointerDown={(e) => e.stopPropagation()}
			>
				<MuratDialogHeader>
					<MuratDialogTitle>Share</MuratDialogTitle>
				</MuratDialogHeader>

				<div className="w-full flex justify-center items-start flex-col">
					<div className="flex justify-center items-center w-full p-4">
						<div className="w-full flex flex-row justify-center items-center h-8 rounded-[10px] bg-neutral-900 shadow-stroke-input-inline overflow-hidden">
							<div className="h-8 py-1.5 px-2 w-full overflow-hidden text-neutral-0 gap-x-1.5 flex flex-row justify-start items-center border-r-[0.5px] border-[#ffffff10]">
								<Link size={14} className="text-neutral-500 min-w-max" />
								<span className="text-sm text-ellipsis overflow-hidden w-full whitespace-nowrap">
									{getReleaseProjectLivePreviewUrl({
										hostname: projectLivePreview.url,
										withScheme: false,
									})}
								</span>
							</div>
							<Button
								variant="muratsecondary"
								fill={'ghost'}
								className="h-8 !w-8 p-0 rounded-r-[10px] rounded-l-none min-w-8"
								onClick={async () => {
									await navigator.clipboard.writeText(
										getReleaseProjectLivePreviewUrl({
											hostname: projectLivePreview.url,
											withScheme: false,
										}),
									);
									setIsCopyTriggered(true);
								}}
							>
								{!isCopyTriggered ?
									<Clipboard color="#fff" size={14} /> :
									<Check size={14} className="text-green-500" />}
							</Button>
						</div>
					</div>

					{projectLivePreview.createdByUser &&
						state.actor.data.id ===
							projectLivePreview.createdByUser._id &&
						(
							<div className="w-full flex flex-col justify-center items-start p-4 border-t-[0.5px] border-t-solid border-[#ffffff10] gap-4">
								<p className="text-sm font-medium text-neutral-0">
									Choose who can leave feedback:
								</p>
								<RadioCard
									isSelected={viewPermission === 'anyoneWithLink'}
									className="w-full"
									onSelect={async () => {
										if (
											currentLoadingPermission !== null ||
											viewPermission === 'anyoneWithLink'
										) {
											return;
										}

										setViewPermission('anyoneWithLink');
										setCurrentLoadingPermission('anyoneWithLink');

										try {
											const result = await webappTrpc.projectLivePreview
												.update.mutate({
													actor: state.actor,
													projectLivePreview: {
														id: state.projectLivePreviewId,
													},
													updates: {
														viewPermission: 'anyoneWithLink',
													},
												});
											if (result.isErr()) {
												toast.procedureError(result);
											} else {
												context.store.setState(updateDoc.action(
													'ProjectLivePreview',
													state.projectLivePreviewId,
													(projectLivePreview) => ({
														...projectLivePreview,
														viewPermission: 'anyoneWithLink',
													}),
												));
											}
										} catch (error) {
											logger.error(error);
											setCurrentLoadingPermission(null);
											setViewPermission(viewPermission);
										} finally {
											setCurrentLoadingPermission(null);
										}
									}}
								>
									<div className="flex flex-col justify-center items-start gap-1 w-full">
										<RadioCardTitle>Anyone with a link</RadioCardTitle>
										<RadioCardDescription>
											Anyone with the link can leave feedback.
										</RadioCardDescription>
									</div>
								</RadioCard>
								<RadioCard
									isSelected={viewPermission ===
										'project'}
									className="w-full"
									onSelect={async () => {
										if (
											currentLoadingPermission !== null ||
											viewPermission === 'project'
										) {
											return;
										}

										setCurrentLoadingPermission('project');
										setViewPermission('project');
										try {
											const updateResult = await webappTrpc
												.projectLivePreview
												.update.mutate({
													actor: state.actor,
													projectLivePreview: {
														id: state.projectLivePreviewId,
													},
													updates: {
														viewPermission: 'project',
													},
												});
											if (updateResult.isErr()) {
												toast.procedureError(updateResult);
											} else {
												context.store.setState(updateDoc.action(
													'ProjectLivePreview',
													state.projectLivePreviewId,
													(projectLivePreview) => ({
														...projectLivePreview,
														viewPermission: 'project',
													}),
												));
											}
										} catch (error) {
											logger.error(error);
											setCurrentLoadingPermission(null);
											setViewPermission(viewPermission);
										} finally {
											setCurrentLoadingPermission(null);
										}
									}}
								>
									<div className="flex flex-col justify-center items-start gap-1 w-full">
										<RadioCardTitle>Project only</RadioCardTitle>
										<RadioCardDescription>
											Only members of this project can leave feedback.
										</RadioCardDescription>
									</div>
								</RadioCard>
								<RadioCard
									isSelected={viewPermission === 'private'}
									className="w-full"
									onSelect={async () => {
										if (
											currentLoadingPermission !== null ||
											viewPermission === 'private'
										) {
											return;
										}

										setCurrentLoadingPermission('private');
										setViewPermission('private');

										try {
											const result = await webappTrpc.projectLivePreview
												.update.mutate({
													actor: state.actor,
													projectLivePreview: {
														id: projectLivePreview._id,
													},
													updates: {
														viewPermission: 'private',
													},
												});
											if (result.isErr()) {
												toast.procedureError(result);
											} else {
												context.store.setState(updateDoc.action(
													'ProjectLivePreview',
													state.projectLivePreviewId,
													(projectLivePreview) => ({
														...projectLivePreview,
														viewPermission,
													}),
												));
											}
										} catch (error) {
											logger.error(error);
											setCurrentLoadingPermission(null);
											setViewPermission(viewPermission);
										} finally {
											setCurrentLoadingPermission(null);
										}
									}}
								>
									<div className="flex flex-col justify-center items-start gap-1 w-full">
										<RadioCardTitle>Only you</RadioCardTitle>
										<RadioCardDescription>
											Only you can leave feedback.
										</RadioCardDescription>
									</div>
								</RadioCard>
							</div>
						)}
				</div>
			</MuratDialogContent>
		</MuratDialog>
	);
}
