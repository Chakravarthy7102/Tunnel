import type { OrganizationMemberRole } from '#types';
import type { WorkosOrganizationMembership } from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import type { Id, SelectInput, SelectOutput } from '@-/database';
import type { UnexpectedError } from '@-/errors';
import { ApiOrganization } from '@-/organization/api';
import { ApiUser } from '@-/user/api';
import { $try, ok, type ResultAsync } from 'errok';

export const ApiOrganizationMember_create = <
	$Include extends SelectInput<'OrganizationMember'>,
>({
	input: {
		data: {
			user,
			organization,
			role,
		},
		include,
	},
}: {
	input: {
		data: {
			user: Id<'User'>;
			organization: Id<'Organization'>;
			role: OrganizationMemberRole;
		};
		include: $Include;
	};
}): ResultAsync<
	SelectOutput<'OrganizationMember', $Include>,
	UnexpectedError
> => ($try(async function*() {
	const workos = getWorkos();

	const workosOrganization = yield* ApiConvex.v.Organization
		.ensureWorkosOrganization({ organization })
		.safeUnwrap();
	const workosUser = yield* ApiConvex.v.User
		.ensureWorkosUser({ user })
		.safeUnwrap();

	let workosOrganizationMembershipId: string;
	try {
		const organizationMembership = await workos.userManagement
			.createOrganizationMembership({
				organizationId: workosOrganization.id,
				userId: workosUser.id,
				roleSlug: role,
			});

		workosOrganizationMembershipId = organizationMembership.id;
	} catch (error) {
		// TODO: check error code
		// might already exist

		const { data: organizationMemberships } = await workos.userManagement
			.listOrganizationMemberships({
				organizationId: workosOrganization.id,
				userId: workosUser.id,
			});

		if (organizationMemberships[0] === undefined) {
			throw error;
		}

		workosOrganizationMembershipId = organizationMemberships[0].id;
	}

	const organizationMember = yield* ApiConvex.v.OrganizationMember._create({
		input: {
			data: {
				organization,
				role,
				user,
				workosOrganizationMembershipId,
			},
			include,
		},
	}).safeUnwrap();

	yield* ApiOrganization.updateSubscriptionAmount({
		organizationId: organization,
	}).safeUnwrap();

	return ok(organizationMember);
}));

/**
	This function is exposed via `ApiOrganizationMember` so that we can pass the entire WorkOS organization membership object to the function
*/
export const ApiOrganizationMember_ensureFromWorkosOrganizationMembership = (
	{ input: { workosOrganizationMembership } }: {
		input: { workosOrganizationMembership: WorkosOrganizationMembership };
	},
) => ($try(async function*() {
	const workos = getWorkos();

	// We first need to ensure the WorkOS organization and the WorkOS user
	const workosOrganization = await workos.organizations.getOrganization(
		workosOrganizationMembership.organizationId,
	);
	yield* ApiOrganization.ensureFromWorkosOrganization({
		input: { workosOrganization },
	}).safeUnwrap();

	const workosUser = await workos.userManagement.getUser(
		workosOrganizationMembership.userId,
	);
	yield* ApiUser.ensureFromWorkosUser({
		input: { workosUser },
	}).safeUnwrap();

	const organizationMemberId = yield* ApiConvex.v.OrganizationMember
		._ensureFromWorkosOrganizationMembership({
			input: {
				workosOrganizationMembership: {
					id: workosOrganizationMembership.id,
					userId: workosOrganizationMembership.userId,
					organizationId: workosOrganizationMembership.organizationId,
					role: workosOrganizationMembership.role
						.slug as OrganizationMemberRole,
				},
			},
		}).safeUnwrap();
	return ok(organizationMemberId);
}));
