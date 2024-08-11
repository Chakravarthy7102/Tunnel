import { env } from '@-/env';
import onetime from 'onetime';
import Stripe from 'stripe';

export const getStripeInstance: () => Stripe = onetime(() => {
	const stripe = new Stripe(env('STRIPE_SECRET'), {
		apiVersion: '2022-11-15',
	});
	return stripe;
});
