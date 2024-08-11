import type {
	CommentsContext,
	StandardIntegrationCreationParams,
} from '#types';
import type {
	AsanaForm,
	JiraForm,
	LinearForm,
	SlackForm,
} from '@-/integrations';
import { getIntegrationPrompt } from '@-/integrations/shared';

export function useSendIntegrations({
	jiraIssue,
	linearIssue,
	slackMessage,
	asanaTask,
	createJiraIssue,
	createLinearIssue,
	createAsanaTask,
	createSlackMessage,
	commentsContext,
}: {
	jiraIssue: JiraForm | null;
	linearIssue: LinearForm | null;
	slackMessage: SlackForm | null;
	asanaTask: AsanaForm | null;
	createJiraIssue: (params: StandardIntegrationCreationParams) => Promise<void>;
	createLinearIssue: (
		params: StandardIntegrationCreationParams,
	) => Promise<void>;
	createAsanaTask: (params: StandardIntegrationCreationParams) => Promise<void>;
	createSlackMessage: (
		params: Omit<StandardIntegrationCreationParams, 'generatedTitlePromise'>,
	) => Promise<void>;
	commentsContext: CommentsContext;
}) {
	const { trpc } = commentsContext;

	// trpc functions
	const generateIntegrationTitleMutation = trpc.projectCommentThread.generate
		.useMutation();

	const sendIntegrations = async ({
		commentThreadId,
		files,
		tunnelUrl,
		text,
	}: Omit<StandardIntegrationCreationParams, 'generatedTitlePromise'>) => {
		const generatedTitlePromise =
			jiraIssue !== null || linearIssue !== null || slackMessage !== null ||
				asanaTask !== null ?
				generateIntegrationTitleMutation.mutateAsync({
					prompt: getIntegrationPrompt(text),
				}).then((result) => result.unwrapOr(text)) :
				Promise.resolve(text);

		await Promise.allSettled([
			createJiraIssue({
				generatedTitlePromise,
				text,
				tunnelUrl,
				files,
				commentThreadId,
			}),
			createLinearIssue({
				generatedTitlePromise,
				text,
				tunnelUrl,
				files,
				commentThreadId,
			}),
			createAsanaTask({
				files,
				generatedTitlePromise,
				text,
				tunnelUrl,
				commentThreadId,
			}),
		]);

		// Slack Message MUST be sent last to wait for relations to be added if there are any from other integrations
		await createSlackMessage({
			text,
			tunnelUrl,
			commentThreadId,
			files,
		});
	};

	return {
		sendIntegrations,
	};
}
