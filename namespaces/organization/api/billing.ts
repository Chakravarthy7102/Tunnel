import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { getStripeInstance } from '@-/stripe';
import { $try, err, ok } from 'errok';

export const ApiOrganization_updateSubscriptionAmount = (
	{ organizationId }: { organizationId: Id<'Organization'> },
) => ($try(async function*() {
	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: organizationId },
		include: {},
	}).safeUnwrap();

	if (organization === null) {
		return err(new DocumentNotFoundError('Organization'));
	}

	if (!organization.stripeSubscriptionId) {
		return ok();
	}

	const stripe = getStripeInstance();

	const subscription = await stripe.subscriptions.retrieve(
		organization.stripeSubscriptionId,
	);

	if (subscription.trial_end && subscription.trial_end * 1000 > Date.now()) {
		return ok();
	}

	const subscriptionItems = await stripe.subscriptionItems.list({
		subscription: subscription.id,
	});

	const subscriptionItem = subscriptionItems.data[0];

	if (!subscriptionItem) {
		return err(new Error('Subscription item not found'));
	}

	const nowInSeconds = Math.floor(Date.now() / 1000);
	const billingCycleRemaining = subscription.current_period_end -
		nowInSeconds;
	const prorationPercentage = billingCycleRemaining /
		(subscription.current_period_end - subscription.current_period_start);

	const updatedQuantity = organization.membersCount;
	const proratedQuantity = Math.ceil(
		(updatedQuantity - (subscriptionItem.quantity ?? 0)) *
			prorationPercentage,
	);

	await stripe.subscriptions.update(organization.stripeSubscriptionId, {
		items: [
			{
				id: subscriptionItem.id,
				quantity: (subscriptionItem.quantity ?? 0) + proratedQuantity,
			},
		],
		proration_behavior: 'create_prorations',
	});

	await stripe.subscriptions.update(organization.stripeSubscriptionId, {
		items: [
			{
				id: subscriptionItem.id,
				quantity: updatedQuantity,
			},
		],
		proration_behavior: 'none',
		billing_cycle_anchor: 'now',
	});

	return ok();
}));
