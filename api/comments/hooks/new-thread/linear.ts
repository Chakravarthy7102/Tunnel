import type {
	CommentsContext,
	StandardIntegrationCreationParams,
} from '#types';
import { type ClientDoc, createDoc, updateDoc } from '@-/client-doc';
import type {
	Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	Project_$commentsProviderData,
	ProjectCommentThreadLinearIssueRelation_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import { getFileUrl } from '@-/file';
import { type LinearForm, useLinearContext } from '@-/integrations';
import { toast } from '@-/tunnel-error';
import { useEffect, useState } from 'react';

export function useLinear({
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
	const createLinearIssueMutation = trpc.linear.createIssue.useMutation();
	const addLinearIntegrationMutation = trpc.projectCommentThread
		.addLinearIntegration.useMutation();

	// state
	const linearDefault = project?.linearSettings?.default ?? null;
	const [linearIssue, setLinearIssue] = useState<LinearForm | null>(
		project?.linearSettings?.createAutomatically ? linearDefault : null,
	);
	const linearContext = useLinearContext(
		actorOrganizationMember === null ? null : {
			container: commentsContext.commentsState.container,
			actorUser,
			actorOrganizationMember,
			trpc: commentsContext.trpc,
			organization,
		},
		linearDefault,
		project?.linearSettings?.createAutomatically ??
			false,
	);

	useEffect(() => {
		const linearDefault = project?.linearSettings?.default ?? null;
		setLinearIssue(
			project?.linearSettings?.createAutomatically ? linearDefault : null,
		);
	}, [project?._id]);

	const createLinearIssue = async ({
		generatedTitlePromise,
		text,
		tunnelUrl,
		commentThreadId,
		files,
	}: StandardIntegrationCreationParams) => {
		if (
			linearIssue?.team && actorOrganizationMember !== null && project !== null
		) {
			const linearTeam = linearIssue.team;
			const generatedTitle = await generatedTitlePromise;
			const createdLinearIssuePromise = createLinearIssueMutation.mutateAsync({
				actor: commentsState.userActor,
				organizationMember: {
					id: actorOrganizationMember._id,
				},
				assignee: linearIssue.assignee,
				description: text,
				labels: linearIssue.labels,
				priority: linearIssue.priority,
				project: linearIssue.project,
				status: linearIssue.status,
				team: linearTeam,
				title: linearIssue.title ?? generatedTitle,
				tunnelUrl,
				attachments: files.map((file) => getFileUrl(file)),
			});

			toast.promise(createdLinearIssuePromise, {
				success: 'Successfully created Linear issue',
				loading: 'Creating Linear issue',
				error: 'Could not create Linear issue',
			});
			const createdLinearIssue = (await createdLinearIssuePromise)
				.unwrapOrThrow();

			const linearIssueRelation =
				(await addLinearIntegrationMutation.mutateAsync({
					createdLinearIssue,
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
			const createLinearIssueRelationAction = createDoc.action(
				'ProjectCommentThreadLinearIssueRelation',
				(create) =>
					create<
						typeof ProjectCommentThreadLinearIssueRelation_$commentsProviderData
					>({
						...linearIssueRelation,
						projectLinearIssue: {
							...linearIssueRelation.projectLinearIssue,
							labels: [],
						},
					}),
			);
			setCommentsState((state) => {
				state = createLinearIssueRelationAction(state);
				return updateDoc.action(
					'ProjectCommentThread',
					commentThreadId,
					(commentThread) => ({
						...commentThread,
						linearIssueRelation: createLinearIssueRelationAction._id,
					}),
				)(state);
			});
		}
	};

	return {
		linearContext,
		linearIssue,
		setLinearIssue,
		linearDefault,
		createLinearIssue,
	};
}
