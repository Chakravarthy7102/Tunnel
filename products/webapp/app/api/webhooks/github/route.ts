/* eslint-disable max-depth -- todo */
/* eslint-disable complexity -- todo */

import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	Project_$organizationAndCommentThreads,
} from '@-/database/selections';
import { ApiUrl } from '@-/url/api';
import type {
	CheckRunRerequestedEvent,
	CheckSuiteRerequestedEvent,
	PullRequestClosedEvent,
	PullRequestOpenedEvent,
	PullRequestSynchronizeEvent,
} from '@octokit/webhooks-types';
import { type NextRequest, NextResponse } from 'next/server';
import { handleCheckRunRerequested } from './check-run/rerequested.ts';
import { handleCheckSuiteRerequested } from './check-suite/rerequested.ts';
import { handlePullRequestClosed } from './pull-request/closed.ts';
import { handlePullRequestOpened } from './pull-request/opened.ts';
import { handlePullRequestSynchronize } from './pull-request/synchronize.ts';

export async function POST(request: NextRequest) {
	const body = await request.json();
	const githubEvent = request.headers.get('X-GitHub-Event');

	if (
		githubEvent !== 'pull_request' && githubEvent !== 'check_run' &&
		githubEvent !== 'check_suite'
	) {
		return NextResponse.json(
			{ error: 'Invalid GitHub event. Expected "pull_request" or "check_run.' },
			{ status: 400 },
		);
	}

	const { action, repository, installation } = body as
		| PullRequestOpenedEvent
		| PullRequestClosedEvent
		| CheckRunRerequestedEvent
		| CheckSuiteRerequestedEvent
		| PullRequestSynchronizeEvent;

	if (installation === undefined) {
		return NextResponse.json(
			{ error: 'No installation found' },
			{ status: 400 },
		);
	}

	const organization = await ApiConvex.v.Organization.get({
		from: {
			githubInstallationId: installation.id,
		},
		include: {},
	});

	if (organization.isErr()) {
		return NextResponse.json(
			{ error: 'Failed to retrieve organization' },
			{ status: 400 },
		);
	}

	if (organization.value === null) {
		return NextResponse.json(
			{ error: 'Tunnel organization not connected with GitHub' },
			{ status: 400 },
		);
	}

	const { githubOrganization } = organization.value;

	if (githubOrganization === null) {
		return NextResponse.json(
			{
				error:
					'The Tunnel organization does not have a linked GitHub organization',
			},
			{ status: 400 },
		);
	}

	// TODO: re-implement
	// const senderUser = await ApiConvex.v.User.get({
	// 	from: { githubAccountUserId: sender.id },
	// 	include: {},
	// }).unwrapOr(null);
	// const timezoneIdentifier = senderUser?.timezone ?? 'UTC';
	// const timezone =
	// 	getTimeZones({ includeUtc: true }).find((tz) =>
	// 		tz.name === timezoneIdentifier
	// 	) ?? { name: 'UTC', abbreviation: 'UTC' };

	const projectsResult = await ApiConvex.v.Project.list({
		include: getInclude(Project_$organizationAndCommentThreads),
		where: {
			githubRepositoryId: repository.id,
		},
		paginationOpts: {
			cursor: null,
			numItems: 100,
		},
	});

	if (projectsResult.isErr()) {
		return NextResponse.json(
			{ error: 'Failed to retrieve projects' },
			{ status: 400 },
		);
	}

	const projects = projectsResult.value.page;

	if (projects.length === 0) {
		return NextResponse.json(body, { status: 200 });
	}

	const baseUrl = ApiUrl.getWebappUrl({
		withScheme: true,
		fromHeaders: request.headers,
	});

	switch (githubEvent) {
		case 'pull_request': {
			switch (action) {
				case 'opened': {
					return handlePullRequestOpened({
						githubOrganizationId: githubOrganization.id,
						projects,
						body,
						baseUrl,
					});
				}

				case 'synchronize': {
					return handlePullRequestSynchronize({
						githubOrganizationId: githubOrganization.id,
						projects,
						body,
					});
				}

				case 'closed': {
					return handlePullRequestClosed({
						body,
					});
				}

				default: {
					return NextResponse.json(
						{ error: 'We do not handle this action yet' },
						{ status: 400 },
					);
				}
			}
		}

		case 'check_run': {
			switch (action) {
				case 'rerequested': {
					return handleCheckRunRerequested({
						body,
						githubOrganizationId: githubOrganization.id,
						projects,
					});
				}

				default: {
					return NextResponse.json(
						{ error: 'We do not handle this action yet' },
						{ status: 400 },
					);
				}
			}
		}

		case 'check_suite': {
			switch (action) {
				case 'rerequested': {
					return handleCheckSuiteRerequested({
						body,
						projects,
						githubOrganizationId: githubOrganization.id,
					});
				}

				default: {
					return NextResponse.json(
						{ error: 'We do not handle this action yet' },
						{ status: 400 },
					);
				}
			}
		}

		default: {
			return NextResponse.json(
				{ error: 'We do not handle this action yet' },
				{ status: 400 },
			);
		}
	}
}
