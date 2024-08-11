import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { env } from '@-/env';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { getStripeInstance } from '@-/stripe';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';

export const billing_checkout = defineProcedure({
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
		const organization = yield* ApiConvex.v.Organization.get({
			from: { id: organizationId },
			include: {},
		}).safeUnwrap();

		if (organization === null) {
			return err(new DocumentNotFoundError('Organization'));
		}

		const customer = organization.stripeCustomerId;
		const priceId = env('STRIPE_TEAM_PRICE_ID');

		const stripe = getStripeInstance();
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: priceId,
					quantity: organization.membersCount,
				},
			],
			mode: 'subscription',
			customer: customer ?? undefined,
			success_url: input.redirectUrl,
			cancel_url: input.redirectUrl,
			currency: 'usd',
		});

		return ok({ checkoutSessionUrl: session.url });
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't create Stripe checkout session",
			error,
		),
});
