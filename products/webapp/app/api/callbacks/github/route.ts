import { getIntegrationRedirects } from '#utils/integration-redirect-url.ts';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { ApiGithub } from '@-/github-integration/api';
import { logger } from '@-/logger';
import { z } from '@-/zod';
import destr from 'destru';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const redirect = getIntegrationRedirects(request, 'github');

	// Parse the URL parameters
	const url = new URL(request.url);

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const installationId = url.searchParams.get('installation_id');

	if (!state) {
		return redirect.missingParams();
	}

	const decodedStateParseResult = z
		.object({
			organizationId: z.string(),
			redirectPath: z.string().nullable(),
			organizationMemberId: z.string(),
		})
		.safeParse(destr(state));

	if (!decodedStateParseResult.success) {
		return redirect.invalidState();
	}

	const { organizationMemberId, redirectPath } = decodedStateParseResult.data;

	try {
		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId as Id<'OrganizationMember'> },
			include: {
				user: true,
				organization: true,
			},
		}).unwrapOrThrow();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (organizationMember === null) {
			logger.error(
				'Redirecting because organizationMember could not be retrieved',
			);

			return redirect.organizationMemberNotFound();
		}

		if (!code) {
			logger.error('Redirecting because code is not defined');
			return redirect.home();
		}

		if (!installationId) {
			logger.error('Redirecting because installationId is not defined');
			return redirect.home();
		}

		const githubOrganization = await ApiGithub.getGithubOrganization({
			installationId: Number(installationId),
		});

		if (githubOrganization === null) {
			logger.error(
				'Redirecting because githubOrganization could not be retrieved',
			);
			return redirect.home();
		}

		await ApiConvex.v.Organization.update({
			input: {
				id: organizationMember.organization._id,
				updates: { githubOrganization },
			},
		}).unwrapOrThrow();

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.connectedGithubOrganization({
			userId: organizationMember.user._id,
			organizationId: organizationMember.organization._id,
		});

		return redirect.success({
			organizationMember,
			redirectPath,
		});
	} catch (error) {
		logger.error(
			'Redirecting because an error occurred while processing the request:',
			error,
		);
		return redirect.unknownError();
	}
}
