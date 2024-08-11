export const INTEGRATION_COPY = {
	GITHUB: {
		description: 'Sync your feedback with your pull requests',
	},
	JIRA: {
		description: 'Create Jira tickets from threads',
	},
	ASANA: {
		description: 'Create Asana tasks from threads',
	},
	LINEAR: {
		description: 'Create Linear issues from threads',
	},
	SLACK: {
		description: 'Create Slack broadcasts from threads',
	},
	GITLAB: {
		description: 'Sync your feedback with your merge requests',
	},
};

export function integrationCopy(
	k: keyof typeof INTEGRATION_COPY,
): string {
	return INTEGRATION_COPY[k].description;
}
