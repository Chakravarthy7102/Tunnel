import type {
	CommentsContext,
	StandardIntegrationCreationParams,
} from '#types';
import { type ClientDoc, createDoc, updateDoc } from '@-/client-doc';
import type {
	Organization_$commentsProviderData,
	OrganizationMember_$actorProfileData,
	Project_$commentsProviderData,
	ProjectCommentThreadSlackMessageRelation_$commentsProviderData,
	User_$profileData,
} from '@-/database/selections';
import { getFileUrl } from '@-/file';
import { type SlackForm, useSlackContext } from '@-/integrations';
import { toast } from '@-/tunnel-error';
import { useEffect, useState } from 'react';

export function useSlack({
	commentsContext,
	project,
	actorOrganizationMember,
	actorUser,
	organization,
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
	const createSlackMessageMutation = trpc.slack.createMessage.useMutation();
	const addSlackIntegrationMutation = trpc.projectCommentThread
		.addSlackIntegration.useMutation();

	// state
	const [slackMessage, setSlackMessage] = useState<SlackForm | null>(
		project !== null ?
			project.slackChannel ?
				{ channel: project.slackChannel } :
				null :
			null,
	);
	const slackContext = useSlackContext(
		actorOrganizationMember === null ? null : {
			container: commentsContext.commentsState.container,
			actorUser,
			actorOrganizationMember,
			trpc: commentsContext.trpc,
			initialSlackMessage: slackMessage ?? undefined,
		},
	);

	useEffect(() => {
		setSlackMessage(
			project !== null ?
				project.slackChannel ?
					{ channel: project.slackChannel } :
					null :
				null,
		);
	}, [project?._id]);

	const createSlackMessage = async ({
		text,
		tunnelUrl,
		commentThreadId,
		files,
	}: Omit<StandardIntegrationCreationParams, 'generatedTitlePromise'>) => {
		if (
			slackMessage?.channel &&
			actorOrganizationMember !== null &&
			project !== null
		) {
			const slackChannel = slackMessage.channel;

			const createdSlackMessagePromise = createSlackMessageMutation.mutateAsync(
				{
					actor: commentsState.userActor,
					organizationMember: {
						id: actorOrganizationMember._id,
					},
					channelId: slackChannel.id,
					channelName: slackChannel.name,
					attachments: files.map((file) => getFileUrl(file)),
					content: text,
					commentThread: { id: commentThreadId },
					tunnelUrl,
					project: {
						id: project._id,
					},
				},
			);

			toast.promise(createdSlackMessagePromise, {
				success: 'Successfully created Slack message',
				loading: 'Creating Slack message',
				error: 'Could not create Slack message',
			});

			const createdSlackMessage = (await createdSlackMessagePromise)
				.unwrapOrThrow();

			const slackMessageRelation =
				(await addSlackIntegrationMutation.mutateAsync({
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
					channelId: createdSlackMessage.channelId,
					messageId: createdSlackMessage.messageId,
					permalink: createdSlackMessage.permalink,
					parentTS: createdSlackMessage.parentTS,
					channelName: slackChannel.name,
				})).unwrapOrThrow();
			const createSlackMessageRelationAction = createDoc.action(
				'ProjectCommentThreadSlackMessageRelation',
				(create) =>
					create<
						typeof ProjectCommentThreadSlackMessageRelation_$commentsProviderData
					>({
						...slackMessageRelation,
						projectSlackMessage: slackMessageRelation.projectSlackMessage,
					}),
			);
			setCommentsState((state) => {
				state = createSlackMessageRelationAction(state);
				return updateDoc.action(
					'ProjectCommentThread',
					commentThreadId,
					(commentThread) => ({
						...commentThread,
						slackMessageRelation: createSlackMessageRelationAction._id,
					}),
				)(state);
			});
		}
	};

	return {
		slackMessage,
		setSlackMessage,
		slackContext,
		createSlackMessage,
	};
}
