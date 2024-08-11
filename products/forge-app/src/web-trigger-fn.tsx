import * as api from '@forge/api';
import FormData from 'form-data';

export const handler = async ({ body }: {
	method: string;
	path: string;
	body: string;
	headers: Record<string, string>;
	queryParameters: Record<string, string[]>;
}) => {
	try {
		// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid JSON
		const parsedBody = JSON.parse(body);

		switch (parsedBody.type) {
			case 'createIssue': {
				const issue = await api
					.asApp()
					.requestJira(api.route`/rest/api/3/issue`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(parsedBody.payload),
					}).then(async (res) => res.json());

				return {
					body: JSON.stringify(issue),
					statusCode: 200,
				};
			}

			case 'getTransitions': {
				const transitions = await api
					.asApp()
					.requestJira(
						api
							.route`/rest/api/3/issue/${parsedBody.payload.issueIdOrKey}/transitions`,
						{
							headers: {
								'Accept': 'application/json',
							},
						},
					)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(transitions),
					statusCode: 200,
				};
			}

			case 'doTransition': {
				const { issueIdOrKey, ...data } = parsedBody.payload;

				const transition = await api
					.asApp()
					.requestJira(
						api.route`/rest/api/3/issue/${issueIdOrKey}/transitions`,
						{
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: JSON.stringify(data),
						},
					)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(transition),
					statusCode: 200,
				};
			}

			case 'deleteIssue': {
				const deletedIssue = await api
					.asApp()
					.requestJira(
						api.route`/rest/api/3/issue/${parsedBody.payload.issueIdOrKey}`,
						{
							method: 'DELETE',
						},
					)
					.then(async (res) => res.text());

				return {
					body: deletedIssue,
					statusCode: 200,
				};
			}

			case 'addAttachment': {
				const formData = new FormData();

				// eslint-disable-next-line unicorn/no-array-for-each -- for-of loops don't work as expected on Forge web triggers
				parsedBody.payload.attachmentDataUrls.forEach(
					(attachment: { filename: string; dataUrl: string }) => {
						formData.append(
							'file',
							Buffer.from(
								attachment.dataUrl.split(',')[1] ?? '',
								'base64',
							),
							attachment.filename,
						);
					},
				);

				const createdAttachments = await api
					.asApp()
					.requestJira(
						api
							.route`/rest/api/3/issue/${parsedBody.payload.issueIdOrKey}/attachments`,
						{
							method: 'POST',
							headers: {
								'Accept': 'application/json',
								'X-Atlassian-Token': 'no-check',
							},
							body: formData,
						},
					)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(createdAttachments),
					statusCode: 200,
				};
			}

			case 'searchProjects': {
				const projects = await api
					.asApp()
					.requestJira(api.route`/rest/api/3/project/search`)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(projects),
					statusCode: 200,
				};
			}

			case 'getIssueTypesForProject': {
				const issueTypes = await api
					.asApp()
					.requestJira(
						api
							.route`/rest/api/3/issuetype/project?projectId=${parsedBody.payload.projectId}`,
					).then(async (res) => res.json());

				return {
					body: JSON.stringify(issueTypes),
					statusCode: 200,
				};
			}

			case 'getAllLabels': {
				const labels = await api
					.asApp()
					.requestJira(api.route`/rest/api/3/label`)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(labels),
					statusCode: 200,
				};
			}

			case 'findUsersAndGroups': {
				const usersAndGroups = await api
					.asApp()
					.requestJira(
						api
							.route`/rest/api/3/groupuserpicker?showAvatar=${parsedBody.payload.showAvatar}&query=${parsedBody.payload.query}`,
					)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(usersAndGroups),
					statusCode: 200,
				};
			}

			case 'getIssuePickerResource': {
				const issues = await api
					.asApp()
					.requestJira(
						api
							.route`/rest/api/3/issue/picker?currentProjectId=${parsedBody.payload.currentProjectId}&query=${parsedBody.payload.query}`,
					)
					.then(async (res) => res.json());

				return {
					body: JSON.stringify(issues),
					statusCode: 200,
				};
			}

			default: {
				return {
					body: 'Invalid request',
					statusCode: 400,
				};
			}
		}
	} catch (error: any) {
		return {
			body: error.message,
			statusCode: 500,
		};
	}
};
