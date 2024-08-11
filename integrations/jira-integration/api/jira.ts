import { ApiJira } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { env } from '@-/env';
import { DocumentNotFoundError } from '@-/errors';
import type {
	CreatedJiraIssue,
	JiraAssignee,
	JiraIssueType,
	JiraParentIssue,
	JiraProject,
} from '@-/integrations';
import { $try, err, ok, type TryOk } from 'errok';
import { DateTime } from 'luxon';

export const ApiJira_chooseTokenType = ({ organizationMemberId }: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*(
	$ok: TryOk<
		{
			accessToken: string;
			refreshToken: string;
			expiresIn: number;
			createdAt: number;
		} | null
	>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			linkedJiraAccount: true,
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return $ok(null);
	}

	if (organizationMember.linkedJiraAccount) {
		return $ok({
			accessToken: organizationMember.linkedJiraAccount.accessToken,
			refreshToken: organizationMember.linkedJiraAccount.refreshToken,
			expiresIn: organizationMember.linkedJiraAccount.expiresIn,
			createdAt: organizationMember.linkedJiraAccount.createdAt,
		});
	}

	return $ok(null);
}));

export const ApiJira_getAccessToken = (
	args:
		& {
			accessToken: string;
			refreshToken: string;
			expiresIn: number;
			createdAt: number;
		}
		& ({
			organizationMemberId: Id<'OrganizationMember'>;
		}),
) => ($try(async function*(
	$ok: TryOk<{ accessToken: string; refreshToken: string }>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: args.organizationMemberId },
		include: {},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const expirationTime = DateTime.fromMillis(args.createdAt * 1000).plus({
		seconds: args.expiresIn,
	});

	if (DateTime.now() < expirationTime) {
		return $ok({
			accessToken: args.accessToken,
			refreshToken: args.refreshToken,
		});
	}

	const tokenData = await fetch('https://auth.atlassian.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			grant_type: 'refresh_token',
			client_id: env('JIRA_APP_CLIENT_ID'),
			client_secret: env('JIRA_APP_CLIENT_SECRET'),
			refresh_token: args.refreshToken,
		}),
	}).then(async (res) => res.json());

	yield* ApiConvex.v.OrganizationMemberIntegration.update({
		input: {
			where: {
				organizationMember: organizationMember._id,
			},
			type: 'OrganizationMemberJiraAccount',
			updates: {
				accessToken: tokenData.access_token,
				refreshToken: tokenData.refresh_token,
				expiresIn: tokenData.expires_in,
				createdAt: DateTime.now().toSeconds(),
			},
		},
	}).safeUnwrap();

	return $ok({
		accessToken: tokenData.access_token as string,
		refreshToken: tokenData.refresh_token as string,
	});
}));

export const ApiJira_createIssue = (
	{
		organizationMemberId,
		assignee,
		issueType,
		parentIssue,
		project,
		labels,
		title,
		description,
		tunnelUrl,
		attachments,
	}: {
		organizationMemberId: Id<'OrganizationMember'>;
		assignee: JiraAssignee | null;
		issueType: JiraIssueType | null;
		parentIssue: JiraParentIssue | null;
		project: JiraProject;
		labels: string[];
		title: string | null | undefined;
		description: string | null;
		tunnelUrl: string;
		attachments: string[];
	},
) => ($try(async function*(
	$ok: TryOk<CreatedJiraIssue>,
) {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			organization: {
				include: {
					jiraOrganization: true,
				},
			},
			user: true,
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const jiraClient = yield* ApiJira.getClient({
		organizationMemberId: organizationMember._id,
	}).safeUnwrap();

	const issue = await jiraClient.issues.createIssue({
		fields: {
			assignee: {
				id: assignee?.accountId,
			},
			project: {
				id: project.id,
			},
			summary: title ?? '',
			description: {
				type: 'doc',
				version: 1,
				content: [
					{
						type: 'paragraph',
						content: [
							{
								text: `${description}\n`,
								type: 'text',
							},
							{
								text: `-------------------------------------\n`,
								type: 'text',
							},
							{
								text: 'Tunnel URL:\n',
								type: 'text',
								marks: [{ type: 'strong' }],
							},
							{
								text: `${tunnelUrl}\n`,
								type: 'text',
								marks: [
									{
										type: 'link',
										attrs: {
											href: tunnelUrl,
											title: 'tunnel url',
										},
									},
								],
							},
							{
								text: `-------------------------------------\n`,
								type: 'text',
							},
							{
								text: 'Captured with ',
								type: 'text',
								marks: [
									{
										type: 'em',
									},
								],
							},
							{
								text: 'Tunnel',
								type: 'text',
								marks: [
									{
										type: 'link',
										attrs: {
											href: 'https://tunnel.dev',
											title: 'tunnel',
										},
									},
									{
										type: 'em',
									},
								],
							},
						],
					},
				],
			},
			issuetype: {
				id: issueType?.id, // set issue type as Task or Story or any other standard issue type
			},
			parent: {
				id: parentIssue?.id,
			},
			labels,
		},
	});

	await Promise.all(
		attachments.map(async (attachment) => {
			const response = await fetch(attachment).then(async (res) => res.blob());

			await jiraClient.issueAttachments.addAttachment({
				attachment: {
					filename: `Attachment ${attachments.indexOf(attachment) + 1}`,
					file: new File(
						[response],
						`Attachment ${attachments.indexOf(attachment) + 1}`,
						{ type: response.type },
					),
				},
				issueIdOrKey: issue.key,
			});
		}),
	);

	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	void serverAnalytics.user.createdJiraIssue({
		userId: organizationMember.user._id,
		organizationId: organizationMember.organization._id,
	});

	return $ok({
		...issue,
		url:
			`${organizationMember.organization.jiraOrganization?.url}/browse/${issue.key}`,
		project,
		assignee,
		issueType,
		parentIssue,
		labels,
	});
}));

export const ApiJira_resolveIssue = (
	{
		organizationMemberId,
		issueId,
	}: {
		organizationMemberId: Id<'OrganizationMember'>;
		issueId: string;
	},
) => ($try(async function*() {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			organization: {
				include: {
					jiraOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const jiraClient = yield* ApiJira.getClient({
		organizationMemberId: organizationMember._id,
	}).safeUnwrap();
	const { transitions } = await jiraClient.issues.getTransitions({
		issueIdOrKey: issueId,
	});

	const doneTransition = transitions?.find(
		(transition: any) => transition.name === 'Done',
	);
	if (!doneTransition) return ok();

	await jiraClient.issues.doTransition({
		issueIdOrKey: issueId,
		transition: {
			id: doneTransition.id,
		},
	});

	return ok();
}));
