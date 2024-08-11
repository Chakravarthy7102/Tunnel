import { getIntegrationRedirects } from '#utils/integration-redirect-url.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { ApiGitlab } from '@-/gitlab-integration/api';
import { logger } from '@-/logger';
import { z } from '@-/zod';
import destr from 'destru';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const redirect = getIntegrationRedirects(request, 'gitlab');

	// Parse the URL parameters
	const url = new URL(request.url);

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	if (!state) {
		return redirect.missingParams();
	}

	const decodedStateParseResult = z
		.object({
			organizationId: idSchema('Organization'),
			redirectPath: z.string().nullable(),
			organizationMemberId: idSchema('OrganizationMember'),
		})
		.safeParse(destr(state));

	if (!decodedStateParseResult.success) {
		return redirect.invalidState();
	}

	const { organizationMemberId, redirectPath } = decodedStateParseResult.data;

	try {
		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				user: true,
				organization: true,
			},
		}).unwrapOrThrow();

		if (organizationMember === null) {
			return redirect.organizationMemberNotFound();
		}

		if (!code) {
			logger.error('Redirecting because code is not defined');
			return redirect.home();
		}

		await ApiGitlab.initializeUser({
			code,
			organizationMemberId: organizationMember._id,
			organizationId: organizationMember.organization._id,
		}).unwrapOrThrow();

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.connectedGitLabOrganization({
			userId: organizationMember.user._id,
			organizationId: organizationMember.organization._id,
		});

		return redirect.success({ organizationMember, redirectPath });
	} catch (error) {
		logger.error(
			'Redirecting because an error occurred while processing the request:',
			error,
		);
		return redirect.unknownError();
	}
}
