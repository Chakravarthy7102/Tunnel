import type { TunnelMessageData } from '#types';

export const successes = {
	GITHUB_REPOSITORY_CONNECT_SUCCESS: () => ({
		title: 'Successfully connected GitHub repository',
		variant: 'message',
	}),
	GITHUB_REPOSITORY_CLEAR_SUCCESS: () => ({
		title: 'Successfully cleared GitHub repository',
		variant: 'message',
	}),
	GITLAB_PROJECT_CONNECT_SUCCESS: () => ({
		title: 'Successfully connected GitLab project',
		variant: 'message',
	}),
	GITLAB_PROJECT_CLEAR_SUCCESS: () => ({
		title: 'Successfully cleared GitLab project',
		variant: 'message',
	}),
	SLACK_BROADCAST_CHANNEL_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated Slack broadcast channel',
		variant: 'message',
	}),
	USER_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated user profile',
		variant: 'message',
	}),
	ASANA_DEFAULT_PERSONAL_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated your default Asana settings',
		variant: 'message',
	}),
	ASANA_DEFAULT_PROJECT_UPDATE_SUCCESS: () => ({
		title: `Successfully updated your project's default Asana settings`,
		variant: 'message',
	}),
	JIRA_DEFAULT_PERSONAL_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated your default Jira settings',
		variant: 'message',
	}),
	JIRA_DEFAULT_PROJECT_UPDATE_SUCCESS: () => ({
		title: `Successfully updated your project's default Jira settings`,
		variant: 'message',
	}),
	LINEAR_DEFAULT_PERSONAL_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated your default Linear settings',
		variant: 'message',
	}),
	LINEAR_DEFAULT_PROJECT_UPDATE_SUCCESS: () => ({
		title: `Successfully updated your project's default Linear settings`,
		variant: 'message',
	}),
	REMOVE_PERSONAL_LINEAR_SUCCESS: () => ({
		title: 'Successfully removed your Linear connection',
		variant: 'message',
	}),
	REMOVE_ORGANIZATION_LINEAR_SUCCESS: () => ({
		title: `Successfully removed your organization's Linear connection`,
		variant: 'message',
	}),
	REMOVE_PERSONAL_JIRA_SUCCESS: () => ({
		title: 'Successfully removed your Jira connection',
		variant: 'message',
	}),
	REMOVE_ORGANIZATION_JIRA_SUCCESS: () => ({
		title: `Successfully removed your organization's Jira connection`,
		variant: 'message',
	}),
	REMOVE_PERSONAL_SLACK_SUCCESS: () => ({
		title: 'Successfully removed your Slack connection',
		variant: 'message',
	}),
	REMOVE_ORGANIZATION_SLACK_SUCCESS: () => ({
		title: `Successfully removed your organization's Slack connection`,
		variant: 'message',
	}),
	REMOVE_ORGANIZATION_GH_SUCCESS: () => ({
		title: "Successfully removed your organization's GitHub connection",
		variant: 'message',
	}),
	SLACK_DEFAULT_PERSONAL_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated your default Slack settings',
		variant: 'message',
	}),
	SEND_INVITATIONS_SUCCESS: () => ({
		title: 'Successfully sent invitations',
		description: 'Invitations will be sent within the next minute',
		variant: 'message',
	}),
	CREATE_PROJECT_SUCCESS: () => ({
		title: 'Successfully created project',
		description: 'You will be redirected shortly',
		variant: 'message',
	}),
	RESEND_INVITATION_SUCCESS: () => ({
		title: 'Successfully resent invitation',
		description: 'The invitation will be sent within the next minute',
		variant: 'message',
	}),
	ORGANIZATION_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated organization',
		variant: 'message',
	}),
	PROJECT_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated project',
		variant: 'message',
	}),
	COPY_CLIPBOARD_SUCCESS: () => ({
		title: 'Successfully copied to clipboard',
		variant: 'message',
	}),
	REMOVE_PROJECT_MEMBER_SUCCESS: () => ({
		title: 'Successfully removed user from project',
		variant: 'message',
	}),
	REMOVE_ORGANIZATION_MEMBER_SUCCESS: () => ({
		title: 'Successfully removed user from organization',
		variant: 'message',
	}),
	CANCEL_INVITATION_SUCCESS: () => ({
		title: 'Succesfully cancelled invitation',
		variant: 'message',
	}),
	UPDATE_PROFILE_IMAGE_SUCCESS: () => ({
		title: 'Successfully updated profile image',
		variant: 'message',
	}),
	PROFILE_UPDATE_SUCCESS: () => ({
		title: 'Successfully updated profile',
		variant: 'message',
	}),
	ORGANIZATION_ROLE_UPDATE_SUCCESS: () => ({
		title: "Successfully updated organization member's role",
		variant: 'message',
	}),
	PROJECT_ROLE_UPDATE_SUCCESS: () => ({
		title: "Successfully updated project member's role",
		variant: 'message',
	}),
	PROJECT_DELETE_SUCCESS: (project: string) => ({
		title: `Successfully deleted project ${project}`,
		variant: 'message',
	}),
	CONNECT_LINEAR_SUCCESS: () => ({
		title: 'Successfully connected to Linear',
		variant: 'message',
	}),
	CONNECT_SLACK_SUCCESS: () => ({
		title: 'Successfully connected to Slack',
		variant: 'message',
	}),
	CONNECT_JIRA_SUCCESS: () => ({
		title: 'Successfully connected to Jira',
		variant: 'message',
	}),
	CONNECT_ASANA_SUCCESS: () => ({
		title: 'Successfully connected to Asana',
		variant: 'message',
	}),
	CONNECT_GH_SUCCESS: () => ({
		title: 'Successfully connected to GitHub',
		variant: 'message',
	}),
	DELETE_ORGANIZATION_SUCCESS: () => ({
		title: 'Successfully deleted organization',
		description: 'You will be redirected shortly',
		variant: 'message',
	}),
} satisfies Record<string, (...params: any) => TunnelMessageData>;
