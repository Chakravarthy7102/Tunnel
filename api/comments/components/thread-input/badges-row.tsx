/* eslint-disable complexity -- TODO */
import { cn } from '@-/design-system/v1';
import type {
	AsanaForm,
	JiraForm,
	LinearForm,
	SlackForm,
} from '@-/integrations';
import {
	AsanaIcon,
	JiraIcon,
	LinearIcon,
	SlackIcon,
} from '@-/integrations/components';
import type { Dispatch, SetStateAction } from 'react';

export function BadgesRow({
	jiraIssue,
	slackMessage,
	linearIssue,
	asanaTask,
	setIsIntegrationDialogOpen,
	setIntegrationPage,
	isToolbar,
}: {
	jiraIssue: JiraForm | null;
	slackMessage: SlackForm | null;
	linearIssue: LinearForm | null;
	asanaTask: AsanaForm | null;
	setIsIntegrationDialogOpen: Dispatch<SetStateAction<boolean>>;
	setIntegrationPage: Dispatch<
		SetStateAction<'home' | 'jira' | 'linear' | 'asana' | 'slack'>
	>;
	isToolbar?: boolean;
}) {
	return (
		<>
			{jiraIssue && (
				<button
					onClick={() => {
						setIsIntegrationDialogOpen(true);
						setIntegrationPage('jira');
					}}
					className={cn(
						isToolbar && 'bg-[#0052CC] hover:opacity-80 disabled:opacity-20',
						isToolbar && 'text-neutral-0 disabled:text-muratblue-dark',
						isToolbar &&
							'border-[#ffffff10] border-solid border rounded-[10px]',
						isToolbar && 'shadow-button-primary overflow-hidden',
					)}
				>
					<JiraIcon size="sm" variant={isToolbar ? 'default' : 'rounded'} />
				</button>
			)}
			{linearIssue && (
				<button
					onClick={() => {
						setIsIntegrationDialogOpen(true);
						setIntegrationPage('linear');
					}}
					className={cn(
						isToolbar && 'bg-[#5C6BF1] hover:opacity-80 disabled:opacity-20',
						isToolbar && 'text-neutral-0 disabled:text-muratblue-dark',
						isToolbar &&
							'border-[#ffffff10] border-solid border rounded-[10px]',
						isToolbar && 'shadow-button-primary overflow-hidden',
					)}
				>
					<LinearIcon size="sm" variant={isToolbar ? 'default' : 'rounded'} />
				</button>
			)}
			{slackMessage && (
				<button
					onClick={() => {
						setIsIntegrationDialogOpen(true);
						setIntegrationPage('slack');
					}}
					className={cn(
						isToolbar && 'bg-[#ffffff] hover:opacity-80 disabled:opacity-20',
						isToolbar && 'text-neutral-0 disabled:text-muratblue-dark',
						isToolbar &&
							'border-[#00000010] border-solid border rounded-[10px]',
						isToolbar && 'shadow-button-primary overflow-hidden',
					)}
				>
					<SlackIcon size="sm" variant={isToolbar ? 'default' : 'rounded'} />
				</button>
			)}
			{asanaTask && (
				<button
					onClick={() => {
						setIsIntegrationDialogOpen(true);
						setIntegrationPage('asana');
					}}
					className={cn(
						isToolbar && 'bg-[#ffffff] hover:opacity-80 disabled:opacity-20',
						isToolbar && 'text-neutral-0 disabled:text-muratblue-dark',
						isToolbar &&
							'border-[#00000010] border-solid border rounded-[10px]',
						isToolbar && 'shadow-button-primary overflow-hidden',
					)}
				>
					<AsanaIcon size="sm" variant={isToolbar ? 'default' : 'rounded'} />
				</button>
			)}
		</>
	);
}
