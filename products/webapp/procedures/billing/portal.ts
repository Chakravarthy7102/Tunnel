import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { getStripeInstance } from '@-/stripe';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';

export const billing_manage = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrHigher,
				plans: 'any',
			})(input, ctx),
			redirectUrl: z.string(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationId = yield* input.organization.safeUnwrap();
		const stripe = getStripeInstance();

		const organization = yield* ApiConvex.v.Organization.get({
			from: { id: organizationId },
			include: {},
		}).safeUnwrap();

		if (organization === null) {
			return err(new DocumentNotFoundError('Organization'));
		}

		const customer = organization.stripeCustomerId;

		if (!customer) {
			return err(new Error('Organization does not have a customer'));
		}

		const session = await stripe.billingPortal.sessions.create({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- bruh
			customer,
			return_url: input.redirectUrl,
		});

		return ok({ portalSessionUrl: session.url });
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't redirect to the Stripe billing portal",
			error,
		),
});
