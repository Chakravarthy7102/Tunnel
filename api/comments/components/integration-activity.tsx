import type { ClientDoc } from '@-/client-doc';
import {
	type ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import {
	AsanaIcon,
	JiraIcon,
	LinearIcon,
	SlackIcon,
} from '@-/integrations/components';
import { dayjs } from '@tunnel/dayjs';

export function IntegrationActivity({
	commentThread,
}: {
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
}) {
	return (
		<>
			{commentThread.jiraIssueRelation !== null && (
				<IntegrationActivityComment
					icon={<JiraIcon variant="rounded" size="sm" />}
					action="created Jira issue"
					name="Tunnel"
					issueKey={commentThread.jiraIssueRelation.projectJiraIssue.key}
					issueLink={commentThread.jiraIssueRelation.projectJiraIssue.url}
					createdAt={commentThread.jiraIssueRelation._creationTime}
				/>
			)}
			{commentThread.linearIssueRelation !== null && (
				<IntegrationActivityComment
					icon={<LinearIcon variant="rounded" size="sm" />}
					action="created Linear issue"
					name="Tunnel"
					issueKey={commentThread.linearIssueRelation.projectLinearIssue
						.identifier}
					issueLink={commentThread.linearIssueRelation.projectLinearIssue
						.issueUrl}
					createdAt={commentThread.linearIssueRelation._creationTime}
				/>
			)}
			{commentThread.slackMessageRelation !== null && (
				<IntegrationActivityComment
					icon={<SlackIcon variant="rounded" size="sm" />}
					action="created Slack broadcast in"
					name="Tunnel"
					issueKey={`#${commentThread.slackMessageRelation.projectSlackMessage.channelName}`}
					issueLink={commentThread.slackMessageRelation.projectSlackMessage
						.permalink}
					createdAt={commentThread.slackMessageRelation._creationTime}
				/>
			)}
			{commentThread.asanaTaskRelation !== null && (
				<IntegrationActivityComment
					icon={<AsanaIcon variant="rounded" size="sm" />}
					action="created Asana task"
					name="Tunnel"
					issueKey={commentThread.asanaTaskRelation.projectAsanaTask.gid}
					issueLink={commentThread.asanaTaskRelation.projectAsanaTask.url}
					createdAt={commentThread.asanaTaskRelation._creationTime}
				/>
			)}
		</>
	);
}

export function IntegrationActivityComment({
	icon,
	name,
	action,
	issueKey,
	issueLink,
	createdAt,
}: {
	icon: React.ReactNode;
	name: string;
	action: string;
	issueKey: string;
	issueLink: string;
	createdAt: number;
}) {
	return (
		<div className="w-full max-w-3xl flex flex-row justify-center items-center gap-x-3">
			<div className="flex flex-col justify-start items-center py-1">
				<div className="relative">
					{icon}
				</div>
			</div>
			<div className="flex flex-col justify-start items-center w-full">
				<div className="flex flex-row justify-between items-center w-full gap-2">
					<div className="flex flex-row justify-center items-center gap-1">
						<p className="text-sm font-normal text-foreground line-clamp-1">
							{name}
						</p>
						<p className="text-sm font-light text-muted-foreground min-w-max">
							{action}
						</p>
						<a
							className="text-sm font-light text-foreground min-w-max hover:underline"
							href={issueLink}
							target="_blank"
						>
							{issueKey}
						</a>
						<p className="text-sm font-light text-muted-foreground min-w-max ml-2">
							{dayjs(createdAt).fromNow()}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
