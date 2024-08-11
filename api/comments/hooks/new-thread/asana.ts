import type {
	CommentsContext,
	StandardIntegrationCreationParams,
} from '#types';
import { type ClientDoc, createDoc, updateDoc } from '@-/client-doc';
import type {
	Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	Project_$commentsProviderData,
	ProjectCommentThreadAsanaTaskRelation_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import { type AsanaForm, useAsanaContext } from '@-/integrations';
import { toast } from '@-/tunnel-error';
import { useEffect, useState } from 'react';

export function useAsana({
	commentsContext,
	organization,
	actorUser,
	actorOrganizationMember,
	project,
}: {
	commentsContext: CommentsContext;
	organization: ClientDoc<typeof Organization_$commentsProviderData>;
	actorUser: ClientDoc<typeof User_$profileData>;
	actorOrganizationMember:
		| ClientDoc<typeof OrganizationMember_$actorProfileData>
		| null;
	project: ClientDoc<typeof Project_$commentsProviderData> | null;
}) {
	// necessary context
	const { trpc, commentsState, setCommentsState } = commentsContext;

	// trpc functions
	const createAsanaTaskMutation = trpc.asana.createTask.useMutation();
	const addAsanaIntegrationMutation = trpc.projectCommentThread
		.addAsanaIntegration.useMutation();
	// state
	const asanaDefault: AsanaForm | null = project?.asanaSettings?.default ??
		null;
	const [asanaTask, setAsanaTask] = useState<AsanaForm | null>(
		project?.asanaSettings?.createAutomatically ? asanaDefault : null,
	);
	const asanaContext = useAsanaContext(
		actorOrganizationMember === null ? null : {
			container: commentsContext.commentsState.container,
			actorUser,
			actorOrganizationMember,
			trpc: commentsContext.trpc,
			organization,
		},
		asanaDefault,
		project?.asanaSettings?.createAutomatically ?? false,
	);

	useEffect(() => {
		const asanaDefault: AsanaForm | null = project?.asanaSettings?.default ??
			null;
		setAsanaTask(
			project?.asanaSettings?.createAutomatically ? asanaDefault : null,
		);
	}, [project?._id]);

	const createAsanaTask = async ({
		generatedTitlePromise,
		commentThreadId,
	}: StandardIntegrationCreationParams) => {
		if (
			asanaTask?.project && actorOrganizationMember !== null && project !== null
		) {
			const asanaProject = asanaTask.project;
			const generatedTitle = await generatedTitlePromise;

			const createdAsanaTaskPromise = createAsanaTaskMutation.mutateAsync({
				actor: commentsState.userActor,
				organizationMember: {
					id: actorOrganizationMember._id,
				},
				project: asanaProject,
				name: asanaTask.name ?? generatedTitle,
				section: asanaTask.section,
				assignee: asanaTask.assignee,
				parentTask: null,
				tags: asanaTask.tags,
			});

			toast.promise(createdAsanaTaskPromise, {
				success: 'Successfully created Asana task',
				loading: 'Creating Asana task',
				error: 'Could not create Asana task',
			});
			const createdAsanaTask = (await createdAsanaTaskPromise).unwrapOrThrow();

			const asanaTaskRelation = (await addAsanaIntegrationMutation.mutateAsync({
				createdAsanaTask,
				actor: commentsState.userActor,
				organization: {
					id: organization._id,
				},
				project: {
					id: project._id,
				},
				projectCommentThread: {
					id: commentThreadId,
				},
			})).unwrapOrThrow();
			const createAsanaTaskRelationAction = createDoc.action(
				'ProjectCommentThreadAsanaTaskRelation',
				(create) =>
					create<
						typeof ProjectCommentThreadAsanaTaskRelation_$commentsProviderData
					>({
						...asanaTaskRelation,
						projectAsanaTask: asanaTaskRelation.projectAsanaTask,
					}),
			);
			setCommentsState((state) => {
				state = createAsanaTaskRelationAction(state);
				state = updateDoc.action(
					'ProjectCommentThread',
					commentThreadId,
					(commentThread) => ({
						...commentThread,
						asanaTaskRelation: createAsanaTaskRelationAction._id,
					}),
				)(state);
				return state;
			});
		}
	};

	return {
		asanaDefault,
		asanaTask,
		setAsanaTask,
		asanaContext,
		createAsanaTask,
	};
}
