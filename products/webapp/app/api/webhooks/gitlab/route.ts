/* eslint-disable max-depth -- todo */
/* eslint-disable complexity -- todo */

import { ApiConvex } from '@-/convex/api';
// import { getTimeZones } from '@vvo/tzdb';
import type { Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	Project_$organizationAndCommentThreads,
} from '@-/database/selections';
import { type NextRequest, NextResponse } from 'next/server';
import { handleMergeRequestClose } from './merge-request/close.ts';
import { handleMergeRequestOpen } from './merge-request/open.ts';
import { handleMergeRequestUpdate } from './merge-request/update.ts';

export async function POST(request: NextRequest) {
	const body = await request.json();
	const organizationId = request.nextUrl.searchParams.get('organizationId');

	const { event_type } = body;

	if (
		event_type !== 'merge_request'
	) {
		return NextResponse.json(
			{ error: 'Invalid GitLab event. Expected "merge_request"' },
			{ status: 200 },
		);
	}

	switch (event_type) {
		case 'merge_request': {
			const { object_attributes, project, user } = body;
			const { action } = object_attributes;

			const { page: projects } = await ApiConvex.v.Project.list({
				where: {
					gitlabProjectId: project.id,
					organization: organizationId as Id<'Organization'>,
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
				include: getInclude(Project_$organizationAndCommentThreads),
			}).unwrapOrThrow();

			if (projects.length === 0) {
				return NextResponse.json(
					{ error: 'Could not find project' },
					{ status: 400 },
				);
			}

			const organizationMember = await ApiConvex.v.OrganizationMember.get({
				from: {
					gitlabId: user.id,
					organization: organizationId as Id<'Organization'>,
				},
				include: {},
			}).unwrapOrThrow();

			if (!organizationMember) {
				return NextResponse.json(
					{ error: 'Could not find associated organization member' },
					{ status: 200 },
				);
			}

			switch (action) {
				case 'open': {
					return handleMergeRequestOpen({
						gitlabProjectId: project.id,
						mergeRequestIid: object_attributes.iid,
						mergeRequestId: object_attributes.id,
						organizationMemberId: organizationMember._id,
						branchName: object_attributes.source_branch,
						commitSha: object_attributes.last_commit.id,
						projects,
					});
				}

				case 'update': {
					return handleMergeRequestUpdate({
						gitlabProjectId: project.id,
						mergeRequestIid: object_attributes.iid,
						mergeRequestId: object_attributes.id,
						branchName: object_attributes.source_branch,
						commitSha: object_attributes.last_commit.id,
						projects,
					});
				}

				case 'close': {
					return handleMergeRequestClose({
						mergeRequestId: object_attributes.id,
					});
				}

				default: {
					return NextResponse.json(
						{ error: 'We do not handle this action yet' },
						{ status: 200 },
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
