import { ApiConvex } from '@-/convex/api';
import type { ServerDoc } from '@-/database';
import type { cookies as nextCookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function WebappApiRedirect_redirectToOrganizationPage({
	actorUser,
	cookies,
	to,
}: {
	actorUser: ServerDoc<'User'>;
	cookies: ReturnType<typeof nextCookies>;
	to: string;
}): Promise<never> {
	const organizationMembers = await ApiConvex.v.OrganizationMember.list({
		where: {
			user: actorUser._id,
			includeProjectGuests: true,
		},
		include: {
			organization: true,
		},
		paginationOpts: {
			cursor: null,
			numItems: 100,
		},
	}).unwrapOrThrow();

	const hasOrganizationInvitations = async () => {
		const organizationInvitations = await ApiConvex.v.OrganizationInvitation
			.list({
				where: {
					user: actorUser._id,
				},
				include: {},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			}).unwrapOrThrow();

		const filteredOrganizationInvitations = organizationInvitations.page.filter(
			(invitation) => invitation.status === 'pending',
		);

		return filteredOrganizationInvitations.length > 0;
	};

	const firstOrganizationMember = organizationMembers.page[0];
	if (firstOrganizationMember === undefined) {
		if (await hasOrganizationInvitations()) {
			return redirect('/join');
		} else {
			return redirect('/welcome');
		}
	}

	const lastVisitedOrganizationId = cookies.get('lastVisitedOrganizationId')
		?.value;

	if (lastVisitedOrganizationId === undefined) {
		return redirect(`/${firstOrganizationMember.organization.slug}`);
	} else {
		const lastVisitedOrganization = await ApiConvex.v.Organization.get({
			from: { id: lastVisitedOrganizationId as any },
			include: {
				projects: {
					include: {
						livePreviews: true,
						organization: true,
					},
				},
			},
		}).unwrapOrThrow();

		// If the organization can't be found (e.g. it was deleted)
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (lastVisitedOrganization === null) {
			if (await hasOrganizationInvitations()) {
				return redirect('/join');
			} else {
				return redirect('/home');
			}
		}

		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: {
				user: actorUser._id,
				organization: lastVisitedOrganization._id,
			},
			include: {},
		}).unwrapOrThrow();

		// If the organization member can't be found (e.g. they were removed), or if the user logged into a different account
		if (organizationMember === null) {
			if (await hasOrganizationInvitations()) {
				return redirect('/join');
			} else {
				return redirect('/home');
			}
		}

		if (
			organizationMember.role === 'owner' &&
			!lastVisitedOrganization.isOnboarded &&
			to !== '/settings/integrations/jira'
		) {
			return redirect(`/${lastVisitedOrganization.slug}/welcome`);
		}

		if (lastVisitedOrganization.projects.length > 0) {
			return redirect(`/${lastVisitedOrganization.slug}${to}`);
		} else {
			return redirect(`/${lastVisitedOrganization.slug}/get-started`);
		}
	}
}
