import { useComments } from '#hooks/comments.ts';
import type { CommentsContext, CommentsState } from '#types';
import { type ClientDoc, select } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import {
	type Organization_$memberProfileData,
	OrganizationMember_$actorProfileData,
} from '@-/database/selections';
import {
	Button,
	buttonVariants,
	cn,
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@-/design-system/v1';
import { RELEASE } from '@-/env/app';
import {
	type AsanaContext,
	type AsanaForm,
	getAsanaAuthUrl,
	getLinearAuthUrl,
	getSlackAuthUrl,
	type JiraContext,
	type JiraForm,
	type LinearContext,
	type LinearForm,
	type SlackContext,
	type SlackForm,
} from '@-/integrations';
import {
	AsanaIcon,
	AsanaTaskDialogContent,
	JiraIcon,
	JiraIssueDialogContent,
	LinearIcon,
	LinearIssueDialogContent,
	SlackIcon,
	SlackMessageDialogContent,
} from '@-/integrations/components';
import { integrationCopy } from '@-/integrations/shared';
import { ApiUrl } from '@-/url/api';
import type { Editor } from '@tiptap/react';
import { ChevronDown } from 'lucide-react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

// eslint-disable-next-line complexity -- TODO
export function IntegrationDialog({
	isOpen,
	setIsOpen,
	commentsContext,
	asanaContext,
	jiraContext,
	linearContext,
	slackContext,
	disabled,
	page,
	setPage,
	editor,
	linearIssue,
	setLinearIssue,
	slackMessage,
	setSlackMessage,
	jiraIssue,
	setJiraIssue,
	asanaTask,
	setAsanaTask,
	organization,
	button,
}: {
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	commentsContext: CommentsContext;
	asanaContext: AsanaContext | null;
	linearContext: LinearContext | null;
	slackContext: SlackContext | null;
	jiraContext: JiraContext | null;
	disabled: boolean;
	page: 'jira' | 'slack' | 'linear' | 'asana' | 'home';
	setPage: Dispatch<
		SetStateAction<'jira' | 'slack' | 'linear' | 'asana' | 'home'>
	>;
	editor: Editor | null;
	linearIssue: LinearForm | null;
	setLinearIssue: Dispatch<SetStateAction<LinearForm | null>>;
	slackMessage: SlackForm | null;
	setSlackMessage: Dispatch<SetStateAction<SlackForm | null>>;
	jiraIssue: JiraForm | null;
	setJiraIssue: Dispatch<SetStateAction<JiraForm | null>>;
	asanaTask: AsanaForm | null;
	setAsanaTask: Dispatch<SetStateAction<AsanaForm | null>>;
	organization: ClientDoc<
		typeof Organization_$memberProfileData
	>;
	button?: React.ReactNode;
}) {
	const { commentsState } = useComments(commentsContext);
	const actorOrganizationMember = select(
		commentsState,
		'OrganizationMember',
		commentsState.actorOrganizationMemberId,
		getInclude(OrganizationMember_$actorProfileData),
	);

	const webappUrl = ApiUrl.getWebappUrl({
		withScheme: true,
		fromRelease: RELEASE,
	});

	if (actorOrganizationMember === null) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{button ?? (
					<Button
						data-testid="integration-dialog-trigger"
						variant="blue"
						size="sm"
						className="rounded-l-none border-l border-solid border-blue-700 p-0 h-8 w-8"
						disabled={disabled}
						onClick={() => {
							setIsOpen(true);
						}}
					>
						<ChevronDown size={14} />
					</Button>
				)}
			</DialogTrigger>

			<DialogContent container={commentsState.container}>
				{page === 'jira' && jiraContext !== null && (
					<JiraIssueDialogContent
						jiraContext={jiraContext}
						jiraIssue={jiraIssue}
						setJiraIssue={setJiraIssue}
						onSave={() => {
							setIsOpen(false);
							setPage('home');
						}}
						onBack={() => {
							setPage('home');
						}}
						commentsContext={commentsContext}
						editorText={editor?.getText() ?? ''}
					/>
				)}
				{page === 'linear' && linearContext !== null && (
					<LinearIssueDialogContent
						linearContext={linearContext}
						linearIssue={linearIssue}
						setLinearIssue={setLinearIssue}
						onSave={() => {
							setIsOpen(false);
							setPage('home');
						}}
						onBack={() => {
							setPage('home');
						}}
						commentsContext={commentsContext}
						editorText={editor?.getText() ?? ''}
					/>
				)}
				{page === 'slack' && slackContext !== null && (
					<SlackMessageDialogContent
						slackContext={slackContext}
						slackMessage={slackMessage}
						setSlackMessage={setSlackMessage}
						onSave={() => {
							setIsOpen(false);
							setPage('home');
						}}
						onBack={() => {
							setPage('home');
						}}
					/>
				)}
				{page === 'asana' && asanaContext !== null && (
					<AsanaTaskDialogContent
						asanaContext={asanaContext}
						asanaTask={asanaTask}
						setAsanaTask={setAsanaTask}
						onSave={() => {
							setIsOpen(false);
							setPage('home');
						}}
						onBack={() => {
							setPage('home');
						}}
						commentsContext={commentsContext}
						editorText={editor?.getText() ?? ''}
					/>
				)}
				{page === 'home' && (
					<>
						<DialogHeader>
							<DialogTitle>Integrations</DialogTitle>
						</DialogHeader>
						<DialogBody>
							<IntegrationRow
								title="Jira"
								description={integrationCopy('JIRA')}
								isLinked={organization.jiraOrganization !== null}
								onCreate={() => setPage('jira')}
								buttonText={jiraIssue ? 'Edit issue' : 'Create issue'}
								connectLinkUrl={`${webappUrl}/${organization.slug}/settings/integrations/jira`}
								logo={<JiraIcon />}
								isPaid={true}
								isDisabled={false}
								organization={organization}
								commentsState={commentsState}
							/>
							<IntegrationRow
								title="Linear"
								description={integrationCopy('LINEAR')}
								isLinked={organization.linearOrganization !== null}
								onCreate={() => setPage('linear')}
								buttonText={linearIssue ? 'Edit issue' : 'Create issue'}
								connectLinkUrl={getLinearAuthUrl({
									isPersonalConnection: false,
									organizationMemberId: actorOrganizationMember._id,
									redirectPath: null,
								})}
								logo={<LinearIcon />}
								isPaid={true}
								isDisabled={false}
								organization={organization}
								commentsState={commentsState}
							/>
							<IntegrationRow
								title="Asana"
								description={integrationCopy('ASANA')}
								isLinked={organization.asanaOrganization !== null}
								onCreate={() => setPage('asana')}
								buttonText={asanaTask ? 'Edit task' : 'Create task'}
								connectLinkUrl={getAsanaAuthUrl({
									isPersonalConnection: false,
									organizationMemberId: actorOrganizationMember._id,
									redirectPath: null,
								})}
								logo={<AsanaIcon />}
								isPaid={true}
								isDisabled={false}
								organization={organization}
								commentsState={commentsState}
							/>
							<IntegrationRow
								title="Slack"
								description={integrationCopy('SLACK')}
								isLinked={organization.slackOrganization !== null}
								onCreate={() => setPage('slack')}
								buttonText={slackMessage ? 'Edit message' : 'Create broadcast'}
								connectLinkUrl={getSlackAuthUrl({
									isPersonalConnection: false,
									organizationMemberId: actorOrganizationMember._id,
									redirectPath: null,
								})}
								logo={<SlackIcon />}
								isPaid={true}
								isDisabled={false}
								organization={organization}
								commentsState={commentsState}
							/>
						</DialogBody>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

const IntegrationRow = ({
	title,
	description,
	logo,
	buttonText,
	isLinked,
	connectLinkUrl,
	isPaid,
	isDisabled,
	onCreate,
}: {
	title: string;
	logo: ReactNode;
	description: string;
	buttonText: string;
	isLinked: boolean;
	connectLinkUrl: string;
	isDisabled: boolean;
	isPaid: boolean;
	organization: ClientDoc<
		typeof Organization_$memberProfileData
	>;
	onCreate: () => void;
	commentsState: CommentsState;
}) => {
	return (
		<div className="flex flex-row justify-between items-center w-full p-4 last:border-none border-b border-solid border-input">
			<div className="flex flex-row justify-center items-center gap-x-4">
				{logo}
				<div className="flex flex-col justify-center items-start">
					<p className="text-sm text-foreground">{title}</p>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{isPaid && !isLinked ?
				(
					<a
						href={connectLinkUrl}
						className={cn(
							buttonVariants({
								variant: 'outline',
							}),
							'gap-x-2',
						)}
					>
						Connect
					</a>
				) :
				(
					<Button variant="outline" disabled={isDisabled} onClick={onCreate}>
						{buttonText}
					</Button>
				)}
		</div>
	);
};
