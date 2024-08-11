import { ApiConvex } from '@-/convex/api';
import { type Id } from '@-/database';
import { getGithubAuthUrl } from '@-/integrations';
import { ApiOrganization } from '@-/organization/api';
import { $try, ok, type TryOk } from 'errok';
import open from 'open';
import pWaitFor from 'p-wait-for';

export const getTestOrganization = ({ ownerUserId }: {
	ownerUserId: Id<'User'>;
}) => ($try(async function*(
	$ok: TryOk<{ organizationId: Id<'Organization'> }>,
) {
	const testOrganizationSlug = 'test-organization';
	const organization = yield* (await $try(async function*() {
		const existingTestOrganization = yield* ApiConvex.v.Organization.get({
			from: { slug: testOrganizationSlug },
			include: {},
		}).safeUnwrap();

		if (existingTestOrganization !== null) {
			return ok(existingTestOrganization);
		}

		const { doc: organization } = yield* ApiOrganization.create({
			input: {
				organization: {
					metadata: {
						ownerRole: null,
						size: null,
					},
					name: 'Test Organization',
					slug: testOrganizationSlug,
					subscriptionPlan: 'free',
					profileImageUrl:
						`https://source.boringavatars.com/marble/120/${testOrganizationSlug}?colors=264653,2a9d8f,e9c46a,f4a261,e76f51&square=true`,
					githubOrganization: null,
					invite: null,
				},
				ownerUser: ownerUserId,
				include: {},
			},
		}).safeUnwrap();

		return ok(organization);
	})).safeUnwrap();

	if (organization.githubOrganization !== null) {
		return $ok({ organizationId: organization._id });
	} else {
		const organizationMember = await ApiConvex.v.OrganizationMember.get({
			from: {
				organization: organization._id,
				user: ownerUserId,
			},
			include: {},
		}).unwrapOrThrow();

		await open(
			getGithubAuthUrl({
				organizationId: organization._id,
				redirectPath: null,
				organizationMemberId: organizationMember?._id ?? '',
			}),
		);

		// Wait until the organization has the `githubOrganization` property set
		await pWaitFor(
			async () => {
				const updatedOrganization = await ApiConvex.v.Organization.get({
					from: { id: organization._id },
					include: {},
				});

				if (updatedOrganization.isErr() || updatedOrganization.value === null) {
					throw new Error('Organization not found');
				}

				return updatedOrganization.value.githubOrganization !== null;
			},
			{ interval: 500 },
		);

		return $ok({
			organizationId: organization._id,
		});
	}
}));
