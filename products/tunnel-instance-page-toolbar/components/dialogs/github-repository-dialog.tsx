import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { select, updateDoc } from '@-/client-doc';
import { useComments } from '@-/comments';
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@-/design-system/v1';
import { GithubRepositoryCombobox } from '@-/integrations/components';
import { useState } from 'react';

export function GithubRepositoryDialog({
	isOpen,
	setIsOpen,
	context,
}: {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProjectLivePreview: true;
		hasProject: true;
	}>;
}) {
	const [isLoading, setIsLoading] = useState(false);

	const shadowRootElement = useShadowRootElement();
	const commentsContext = useCommentsContext({ context });
	const { trpc } = useComments(commentsContext);
	const state = useContextStore(context);
	const actorUser = select(state, 'User', state.actor.data.id);
	const project = select(state, 'Project', state.projectId, {
		organization: true,
	});

	const updateProject = trpc.project.update.useMutation();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				container={shadowRootElement}
				className="w-full flex flex-col"
				onPointerDown={(e) => e.stopPropagation()}
			>
				<DialogHeader>
					<DialogTitle>Connect repository</DialogTitle>
				</DialogHeader>
				<DialogBody className="gap-y-2">
					<DialogDescription>
						Select a GitHub repository to connect to your project. This will
						allow you to sync your Tunnel comments directly to your pull
						requests.
					</DialogDescription>
					<div className="w-full flex justify-center items-start flex-col">
						<GithubRepositoryCombobox
							container={shadowRootElement}
							actorUser={actorUser}
							organization={project.organization}
							setValue={(repo) => {
								context.store.setState(updateDoc.action(
									'Project',
									project._id,
									(project) => ({
										...project,
										githubRepository: repo,
									}),
								));
							}}
							value={project.githubRepository}
							trpc={trpc}
							isFullWidth={false}
						/>
					</div>
				</DialogBody>

				<DialogFooter>
					<Button
						isLoading={isLoading}
						onClick={() => {
							setIsLoading(true);
							updateProject.mutate(
								{
									project: {
										id: project._id,
									},
									actor: {
										type: 'User',
										data: { id: actorUser._id },
									},
									updates: {
										githubRepository: project.githubRepository,
									},
								},
								{
									onSettled() {
										setIsOpen(false);
										setIsLoading(false);
									},
								},
							);
						}}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
