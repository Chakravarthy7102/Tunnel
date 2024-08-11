import { ApiConvex } from '@-/convex/api';
import { logger } from '@-/logger';
import {} from '@-/database';
import { env } from '@-/env';
import { getStripeInstance } from '@-/stripe';
import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
	const webhookSecret = env('STRIPE_WEBHOOK_SECRET');

	const sig = request.headers.get('stripe-signature');

	if (typeof sig !== 'string') {
		logger.error('Missing or invalid Stripe signature header');
		return NextResponse.json(
			{
				error: {
					message: 'Missing or invalid Stripe signature header',
				},
			},
			{
				status: 500,
			},
		);
	}

	const stripe = getStripeInstance();

	let event: Stripe.Event;
	try {
		const buf = await request.text();
		event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error('Webhook Error:', error.message);
			return NextResponse.json(
				{
					error: {
						error,
						message: `Webhook Error: ${error.message}`,
					},
				},
				{
					status: 500,
				},
			);
		} else {
			logger.error('Webhook Error:', error);
			return NextResponse.json(
				{
					error: {
						error,
						message: `Webhook Error: UNKNOWN`,
					},
				},
				{
					status: 500,
				},
			);
		}
	}

	switch (event.type) {
		case 'customer.subscription.created': {
			const { customer, id } = event.data.object as Stripe.Subscription;

			if (typeof customer !== 'string') {
				logger.error('No customer found for subscription:', id);
				return NextResponse.json(
					{
						error: {
							message: `No customer found for subscription ${id}`,
						},
					},
					{ status: 404 },
				);
			}

			const organization = await ApiConvex.v.Organization.get({
				from: {
					stripeCustomerId: customer,
				},
				include: {},
			}).unwrapOrThrow();

			if (organization === null) {
				logger.error('No organization found for customer', customer);
				return NextResponse.json(
					{
						error: {
							message: `No organization found for customer ${customer}`,
						},
					},
					{ status: 404 },
				);
			}

			try {
				await ApiConvex.v.Organization.update({
					input: {
						id: organization._id,
						updates: {
							stripeSubscriptionId: id,
							subscriptionPlan: 'team',
						},
					},
				}).unwrapOrThrow();

				const { page: organizationMembers } = await ApiConvex.v
					.OrganizationMember
					.list({
						where: {
							includeProjectGuests: false,
							organization: organization._id,
						},
						include: {
							user: true,
						},
						paginationOpts: {
							cursor: null,
							numItems: 100,
						},
					}).unwrapOrThrow();

				const ownerOrganizationMember = organizationMembers.find(
					(organizationMember) => organizationMember.role === 'owner',
				);

				if (ownerOrganizationMember !== undefined) {
					return NextResponse.json(
						{
							message:
								`Successfully updated organization ${organization._id} with subscription ${id}`,
						},
						{
							status: 200,
						},
					);
				}
			} catch (error) {
				logger.error('Error updating organization', error);
				return NextResponse.json(
					{
						error: {
							error,
							message:
								`Error updating organization ${organization._id} with subscription ${id}`,
						},
					},
					{
						status: 500,
					},
				);
			}

			break;
		}

		case 'customer.subscription.deleted': {
			const { customer, id } = event.data.object as Stripe.Subscription;
			if (typeof customer !== 'string') {
				return NextResponse.json(
					{
						error: {
							message: `No customer found for subscription ${id}`,
						},
					},
					{
						status: 404,
					},
				);
			}

			const organization = await ApiConvex.v.Organization.get({
				from: {
					stripeCustomerId: customer,
				},
				include: {},
			}).unwrapOrThrow();

			if (organization === null) {
				logger.error('No organization found for customer', customer);
				return NextResponse.json(
					{
						error: {
							message: `No organization found for customer ${customer}`,
						},
					},
					{ status: 404 },
				);
			}

			await ApiConvex.v.Organization.update({
				input: {
					id: organization._id,
					updates: {
						stripeSubscriptionId: null,
						subscriptionPlan: 'free',
					},
				},
			}).unwrapOrThrow();

			const { page: organizationMembers } = await ApiConvex.v.OrganizationMember
				.list({
					where: {
						includeProjectGuests: false,
						organization: organization._id,
					},
					include: {
						user: true,
					},
					paginationOpts: {
						cursor: null,
						numItems: 100,
					},
				}).unwrapOrThrow();

			const ownerOrganizationMember = organizationMembers.find(
				(organizationMember) => organizationMember.role === 'owner',
			);

			if (ownerOrganizationMember !== undefined) {
				return NextResponse.json(
					{
						message:
							`Successfully updated organization ${organization._id} with subscription ${id}`,
					},
					{
						status: 200,
					},
				);
			}

			return NextResponse.json(
				{
					message:
						`Successfully updated organization ${organization._id} with subscription ${id}`,
				},
				{
					status: 200,
				},
			);
		}

		default: {
			logger.error(`Unhandled event type: ${event.type}`);
			return NextResponse.json(
				{
					error: {
						message: `Unhandled event type ${event.type}`,
					},
				},
				{ status: 501 },
			);
		}
	}
}
