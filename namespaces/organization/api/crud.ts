import type { WorkosOrganization } from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import type {
	Id,
	SelectInput,
	SelectOutput,
} from '@-/database';
import { UnexpectedError } from '@-/errors';
import type { GithubOrganization } from '@-/github-integration';
import type {
	OrganizationMetadata,
	OrganizationSubscriptionPlan,
} from '@-/organization';
import { getStripeInstance } from '@-/stripe';
import { $try, err, ok, ResultAsync } from 'errok';
import type { Stripe } from 'stripe';

export const ApiOrganization_create = <
	// dprint-ignore
	$Include extends SelectInput<'Organization'>,
>({
	input: {
		organization,
		ownerUser,
		createOwnerOrganizationMember,
		include,
	},
}: {
	input: {
		organization: {
			profileImageUrl: string | null;
			slug: string;
			name: string;
			subscriptionPlan: OrganizationSubscriptionPlan;
			metadata: OrganizationMetadata;
			invite: {
				id: string | null;
				createdAt: number | null;
			} | null;
			githubOrganization: GithubOrganization | null;
			isOnboarded?: boolean;
		};
		ownerUser: Id<'User'>;
		createOwnerOrganizationMember?: boolean;
		include: $Include;
	};
}): ResultAsync<{
	doc: SelectOutput<'Organization', $Include>;
	ownerOrganizationMemberId: Id<'OrganizationMember'> | null;
}, UnexpectedError> => (
	ResultAsync.fromFunction(async () => {
		const stripe = getStripeInstance();
		const workos = getWorkos();
		let stripeCustomer: Stripe.Response<Stripe.Customer> | undefined;
		let workosOrganization: WorkosOrganization | undefined;

		const ownerWorkosUser = await ApiConvex.v.User.ensureWorkosUser({
			user: ownerUser,
		}).unwrapOrThrow();

		try {
			stripeCustomer = await stripe.customers.create({
				name: organization.name,
			});

			workosOrganization = await workos.organizations.createOrganization({
				name: organization.name,
				allowProfilesOutsideOrganization: true,
			});
			const workosOrganizationMembership = await workos.userManagement
				.createOrganizationMembership({
					organizationId: workosOrganization.id,
					userId: ownerWorkosUser.id,
				});

			const organizationData = await ApiConvex.v.Organization._create({
				input: {
					organization: {
						...organization,
						workosOrganizationId: workosOrganization.id,
						svixAppId: null,
						stripeCustomerId: stripeCustomer.id,
						stripeSubscriptionId: null,
						isOnboarded: organization.isOnboarded ?? false,
					},
					createOwnerOrganizationMember: createOwnerOrganizationMember ?? true,
					ownerWorkosOrganizationMembershipId: workosOrganizationMembership.id,
					ownerUser,
					include,
				},
			}).unwrapOrThrow();

			return ok(organizationData);
		} catch (error) {
			if (stripeCustomer !== undefined) {
				await stripe.customers.del(stripeCustomer.id);
			}

			if (workosOrganization !== undefined) {
				await workos.organizations.deleteOrganization(workosOrganization.id);
			}

			return err(
				new UnexpectedError('while creating the organization', {
					cause: error as Error,
				}),
			);
		}
	})
);

export const ApiOrganization_delete = (
	{ input }: { input: { id: Id<'Organization'> } },
) => ($try(async function*() {
	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: input.id },
		include: {},
	}).safeUnwrap();
	if (organization?.workosOrganizationId) {
		const workos = getWorkos();
		const deleteResult = await ResultAsync.fromPromise(
			workos.organizations.deleteOrganization(
				organization.workosOrganizationId,
			),
			(error) => error as Error & { code: string },
		);

		if (deleteResult.isErr()) {
			// Ignore "Organization not found" errors
			if (deleteResult.error.code !== 'entity_not_found') {
				return err(deleteResult.error);
			}
		}
	}

	return ok();
}));

/**
	This function is exposed via `ApiOrganization` so that we can pass the entire WorkOS organization object to the function
*/
export const ApiOrganization_ensureFromWorkosOrganization = (
	{ input: { workosOrganization } }: {
		input: { workosOrganization: WorkosOrganization };
	},
) => ($try(async function*() {
	const organizationId = yield* ApiConvex.v.Organization
		._ensureFromWorkosOrganization({
			input: {
				workosOrganization: {
					id: workosOrganization.id,
					name: workosOrganization.name,
					domains: workosOrganization.domains.map(({ domain }) => domain),
				},
			},
		}).safeUnwrap();
	return ok(organizationId);
}));
