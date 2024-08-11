import type {
	WorkosOrganization,
	WorkosOrganizationMembership,
	WorkosUser,
} from '@-/auth';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import { env } from '@-/env';
import { APP_ENV } from '@-/env/app';
import type { OrganizationMemberRole } from '@-/organization-member';
import { ApiOrganizationMember } from '@-/organization-member/api';
import { ApiOrganization } from '@-/organization/api';
import { ApiUser } from '@-/user/api';
import type { NextRequest } from 'next/server';
import nullthrows from 'nullthrows-es';

export async function POST(request: NextRequest) {
	const workos = getWorkos();
	const payload = await request.json();
	const sigHeader = request.headers.get('workos-signature');
	if (sigHeader === null) {
		return new Response('Missing signature', { status: 400 });
	}

	if (APP_ENV === 'development') {
		return webhookEventHandlers[payload.event]?.(payload.data) ??
			new Response('Invalid event', { status: 400 });
	}

	const webhook = await workos.webhooks.constructEvent({
		payload,
		sigHeader,
		secret: env('WORKOS_WEBHOOK_SECRET'),
	});

	return webhookEventHandlers[webhook.event]?.(webhook.data) ??
		new Response('Invalid event', { status: 400 });
}

const webhookEventHandlers: Record<
	string,
	(data: any) => Promise<Response>
> = {
	async 'organization.created'(data: WorkosOrganization) {
		const organizationResult = await ApiOrganization
			.ensureFromWorkosOrganization({
				input: {
					workosOrganization: data,
				},
			});

		if (organizationResult.isOk()) {
			return new Response('Organization created', { status: 200 });
		} else {
			return new Response('Error creating organization', { status: 500 });
		}
	},
	async 'organization.updated'(data: WorkosOrganization) {
		const organizationIdResult = await ApiOrganization
			.ensureFromWorkosOrganization({
				input: {
					workosOrganization: data,
				},
			});

		if (organizationIdResult.isErr()) {
			return new Response('Error updating organization', { status: 500 });
		}

		const updateResult = await ApiConvex.v.Organization.update({
			input: {
				id: organizationIdResult.value,
				updates: {
					name: data.name,
				},
			},
		});

		if (updateResult.isErr()) {
			return new Response('Error updating organization', { status: 500 });
		}

		return new Response('Organization updated', { status: 200 });
	},
	async 'organization.deleted'(data: WorkosOrganization) {
		const organizationResult = await ApiConvex.v.Organization.get({
			from: { workosOrganizationId: data.id },
			include: {},
		});

		if (organizationResult.isErr()) {
			return new Response('Error deleting organization', { status: 500 });
		}

		if (organizationResult.value === null) {
			return new Response('Successfully deleted organization', { status: 200 });
		}

		const deleteResult = await ApiOrganization.delete({
			input: { id: organizationResult.value._id },
		});

		if (deleteResult.isErr()) {
			return new Response('Error deleting organization', { status: 500 });
		}

		return new Response('Successfully deleted organization', { status: 200 });
	},
	async 'organization_membership.added'(data: WorkosOrganizationMembership) {
		const organizationMemberResult = await ApiOrganizationMember
			.ensureFromWorkosOrganizationMembership({
				input: {
					workosOrganizationMembership: data,
				},
			});

		if (organizationMemberResult.isErr()) {
			return new Response('Error adding organization member', { status: 500 });
		}

		return new Response('Organization member added', { status: 200 });
	},
	async 'organization_membership.created'(
		data: WorkosOrganizationMembership,
	) {
		return nullthrows(webhookEventHandlers['organization_membership.added'])(
			data,
		);
	},
	async 'organization_membership.deleted'(
		data: WorkosOrganizationMembership,
	) {
		const organizationMemberResult = await ApiConvex.v.OrganizationMember.get({
			from: { workosOrganizationMembershipId: data.id },
			include: {},
		});

		if (organizationMemberResult.isErr()) {
			return new Response('Error deleting organization member', {
				status: 500,
			});
		}

		if (organizationMemberResult.value === null) {
			return new Response('Successfully deleted organization member', {
				status: 200,
			});
		}

		const deleteResult = await ApiConvex.v.OrganizationMember.delete({
			input: { id: organizationMemberResult.value._id },
		});

		if (deleteResult.isErr()) {
			return new Response('Error deleting organization member', {
				status: 500,
			});
		}

		return new Response('Successfully deleted organization member', {
			status: 200,
		});
	},
	async 'organization_membership.removed'(
		data: WorkosOrganizationMembership,
	) {
		return nullthrows(webhookEventHandlers['organization_membership.deleted'])(
			data,
		);
	},
	async 'organization_membership.updated'(
		data: WorkosOrganizationMembership,
	) {
		const organizationMemberIdResult = await ApiOrganizationMember
			.ensureFromWorkosOrganizationMembership({
				input: {
					workosOrganizationMembership: data,
				},
			});

		if (organizationMemberIdResult.isErr()) {
			return new Response('Error updating organization membership', {
				status: 500,
			});
		}

		const updateResult = await ApiConvex.v.OrganizationMember.update({
			input: {
				id: organizationMemberIdResult.value,
				updates: {
					role: data.role.slug as OrganizationMemberRole,
				},
			},
		});

		if (updateResult.isErr()) {
			return new Response('Error updating organization membership', {
				status: 500,
			});
		}

		return new Response('Organization membership updated', { status: 200 });
	},
	async 'user.created'(data: WorkosUser) {
		const userResult = await ApiUser
			.ensureFromWorkosUser({
				input: {
					workosUser: data,
				},
			});

		if (userResult.isOk()) {
			return new Response('User created', { status: 200 });
		} else {
			return new Response('Error creating user', { status: 500 });
		}
	},
	async 'user.updated'(data: WorkosUser) {
		const userResult = await ApiUser
			.ensureFromWorkosUser({
				input: {
					workosUser: data,
				},
			});

		if (userResult.isErr()) {
			return new Response('Error updating user', { status: 500 });
		}

		const updateResult = await ApiUser.update({
			input: {
				id: userResult.value,
				updates: {
					email: data.email,
					fullName: [
						data.firstName?.trim() ?? '',
						data.lastName?.trim() ?? '',
					].join(' '),
				},
			},
		});

		if (updateResult.isErr()) {
			return new Response('Error updating user', { status: 500 });
		}

		return new Response('User updated', { status: 200 });
	},
	async 'user.deleted'(data: WorkosUser) {
		const userResult = await ApiConvex.v.User.get({
			from: { workosUserId: data.id },
			include: {},
		});

		if (userResult.isErr()) {
			return new Response('Error deleting user', { status: 500 });
		}

		if (userResult.value === null) {
			return new Response('Successfully deleted user', { status: 200 });
		}

		const deleteResult = await ApiUser.delete({
			input: { id: userResult.value._id },
		});

		if (deleteResult.isErr()) {
			return new Response('Error deleting user', { status: 500 });
		}

		return new Response('Successfully deleted user', { status: 200 });
	},
};
