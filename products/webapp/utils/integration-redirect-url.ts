import type { Selection, ServerDoc } from '@-/database';
import { ApiUrl } from '@-/url/api';
import { NextResponse } from 'next/server';

export function getIntegrationRedirects(
	request: Request,
	integrationSlug: string,
) {
	const getResponse = (
		{ path, query }: { path: string; query?: Record<string, string> },
	) =>
		NextResponse.redirect(ApiUrl.getWebappUrl({
			fromHeaders: request.headers,
			withScheme: true,
			path,
			query,
		}));

	const failureToastQuery = {
		toast: `CONNECT_${integrationSlug.toUpperCase()}_ERROR`,
	};

	return {
		home: () => getResponse({ path: '/home' }),
		missingParams: () => getResponse({ path: '/home' }),
		invalidState: () => getResponse({ path: '/home' }),
		organizationMemberNotFound: () => getResponse({ path: '/home' }),
		jiraOrganizationNotFound: () => getResponse({ path: '/home' }),
		missingAccessToken: (
			{ organizationMember }: {
				organizationMember: ServerDoc<
					Selection<'OrganizationMember', { organization: true; user: true }>
				>;
			},
		) =>
			getResponse({
				path:
					`/${organizationMember.organization.slug}/settings/integrations/${integrationSlug}`,
				query: failureToastQuery,
			}),
		success(
			{ organizationMember, redirectPath }: {
				organizationMember: ServerDoc<
					Selection<'OrganizationMember', { organization: true; user: true }>
				>;
				redirectPath: string | null;
			},
		) {
			const basePath = redirectPath ??
				`/${organizationMember.organization.slug}/settings/integrations/${integrationSlug}`;
			const url = new URL(
				ApiUrl.getWebappUrl({
					path: basePath,
					withScheme: true,
					fromHeaders: request.headers,
				}),
			);
			url.searchParams.append(
				'toast',
				`CONNECT_${integrationSlug.toUpperCase()}_SUCCESS`,
			);
			return getResponse({
				path: url.pathname + url.search,
			});
		},
		unknownError: () =>
			getResponse({ path: '/home', query: failureToastQuery }),
	};
}
