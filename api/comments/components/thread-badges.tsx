import type { CommentsContext } from '#types';
import type { ClientDoc } from '@-/client-doc';
import type { ProjectCommentThread_$commentsProviderData } from '@-/database/selections';
import { Badge } from '@-/design-system/v1';
import {
	AsanaIcon,
	JiraIcon,
	LinearIcon,
	SlackIcon,
} from '@-/integrations/components';
import { EnvironmentDialogButton } from './dialogs/environment-dialog-button.tsx';

export function ThreadBadges({
	commentThread,
	commentsContext,
}: {
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$commentsProviderData
	>;
	commentsContext: CommentsContext;
}) {
	return (
		<div className="flex flex-row justify-start items-center flex-wrap gap-1 border-solid border-b border-border w-full">
			{(commentThread.consoleLogsFile !== null ||
				commentThread.windowMetadata_ !== null ||
				commentThread.gitMetadata_ !== null) && (
				<EnvironmentDialogButton
					commentsContext={commentsContext}
					commentThread={commentThread}
					size="sm"
				/>
			)}
			{commentThread.jiraIssueRelation !== null && (
				<a
					href={commentThread.jiraIssueRelation.projectJiraIssue
						.url}
					target="_blank"
				>
					<Badge size="sm">
						<JiraIcon variant="rounded" size="xs" />
						{commentThread.jiraIssueRelation.projectJiraIssue.key}
					</Badge>
				</a>
			)}
			{commentThread.linearIssueRelation !== null && (
				<a
					href={commentThread.linearIssueRelation.projectLinearIssue
						.issueUrl}
					target="_blank"
				>
					<Badge size="sm">
						<LinearIcon variant="rounded" size="xs" />
						{commentThread.linearIssueRelation.projectLinearIssue
							.identifier}
					</Badge>
				</a>
			)}
			{commentThread.slackMessageRelation !== null && (
				<a
					href={commentThread.slackMessageRelation
						.projectSlackMessage
						.permalink}
					target="_blank"
				>
					<Badge size="sm" className="gap-x-2">
						<SlackIcon variant="rounded" size="xs" />
						#{commentThread.slackMessageRelation.projectSlackMessage
							.channelName}
					</Badge>
				</a>
			)}
			{commentThread.asanaTaskRelation !== null && (
				<a
					href={commentThread.asanaTaskRelation.projectAsanaTask.url}
					target="_blank"
				>
					<Badge size="md" className="gap-x-2">
						<AsanaIcon variant="rounded" size="xs" />
						{commentThread.asanaTaskRelation.projectAsanaTask.gid}
					</Badge>
				</a>
			)}
		</div>
	);
}
