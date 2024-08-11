import type {
	CommentsContext,
	StandardIntegrationCreationParams,
} from '#types';
import { type ClientDoc, createDoc, updateDoc } from '@-/client-doc';
import type {
	Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	Project_$commentsProviderData,
	ProjectCommentThreadJiraIssueRelation_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import { getFileUrl } from '@-/file';
import { type JiraForm, useJiraContext } from '@-/integrations';
import { toast } from '@-/tunnel-error';
import { useEffect, useState } from 'react';

export function useJira({
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
	const createJiraIssueMutation = trpc.jira.createIssue
		.useMutation();
	const addJiraIntegrationMutation = trpc.projectCommentThread
		.addJiraIntegration.useMutation();

	// state that we will use
	const jiraDefault: JiraForm | null = project?.jiraSettings?.default ?? null;
	const [jiraIssue, setJiraIssue] = useState<JiraForm | null>(
		project?.jiraSettings?.createAutomatically ? jiraDefault : null,
	);
	const jiraContext = useJiraContext(
		actorOrganizationMember === null ? null : {
			container: commentsState.container,
			actorUser,
			actorOrganization: organization,
			actorOrganizationMember,
			trpc,
		},
		jiraDefault,
		project?.jiraSettings?.createAutomatically ?? false,
	);

	useEffect(() => {
		const jiraDefault: JiraForm | null = project?.jiraSettings?.default ?? null;
		setJiraIssue(
			project?.jiraSettings?.createAutomatically ? jiraDefault : null,
		);
	}, [project?._id]);

	// actions
	const createJiraIssue = async ({
		generatedTitlePromise,
		text,
		tunnelUrl,
		commentThreadId,
		files,
	}: StandardIntegrationCreationParams) => {
		if (
			jiraIssue?.project && actorOrganizationMember !== null && project !== null
		) {
			const jiraProject = jiraIssue.project;
			const generatedTitle = await generatedTitlePromise;

			const createdJiraIssuePromise = createJiraIssueMutation.mutateAsync({
				actor: commentsContext.commentsState.userActor,
				organizationMember: {
					id: actorOrganizationMember._id,
				},
				assignee: jiraIssue.assignee,
				issueType: jiraIssue.issueType,
				labels: jiraIssue.labels,
				parentIssue: null,
				project: jiraProject,
				title: jiraIssue.title ?? generatedTitle,
				description: text,
				tunnelUrl,
				attachments: files.map((file) => getFileUrl(file)),
			});

			toast.promise(createdJiraIssuePromise, {
				success: 'Successfully created Jira issue',
				loading: 'Creating Jira issue',
				error: 'Could not create Jira Issue',
			});

			const createdJiraIssue = (await createdJiraIssuePromise).unwrapOrThrow();
			const jiraIssueRelation = (await addJiraIntegrationMutation.mutateAsync({
				createdJiraIssue,
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
			const createJiraIssueRelationAction = createDoc.action(
				'ProjectCommentThreadJiraIssueRelation',
				(create) =>
					create<
						typeof ProjectCommentThreadJiraIssueRelation_$commentsProviderData
					>({
						...jiraIssueRelation,
						projectJiraIssue: {
							...jiraIssueRelation.projectJiraIssue,
							labels: [],
						},
					}),
			);

			setCommentsState((state) => {
				state = createJiraIssueRelationAction(state);
				return updateDoc.action(
					'ProjectCommentThread',
					commentThreadId,
					(commentThread) => ({
						...commentThread,
						jiraIssueRelation: createJiraIssueRelationAction._id,
					}),
				)(state);
			});
		}
	};

	return {
		jiraDefault,
		jiraIssue,
		setJiraIssue,
		jiraContext,
		createJiraIssue,
	};
}
