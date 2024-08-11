import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { isCancel, SelectPrompt, TextPrompt } from '@clack/core';
import chalk from 'chalk';
import { $try, err, type TryOk } from 'errok';
import { outdent } from 'outdent';
import randomInteger from 'random-int';

export const promptSelectOrganization = ({
	actor,
	providedOrganizationSlug,
}: {
	actor: Actor<'User'>;
	providedOrganizationSlug: string | null;
}) => ($try(async function*(
	$ok: TryOk<{
		organizationMember: {
			_id: Id<'OrganizationMember'>;
			organization: {
				_id: Id<'Organization'>;
				name: string;
				slug: string;
			};
		};
	}>,
) {
	const { webappTrpc } = await getWebappTrpc();

	if (providedOrganizationSlug !== null) {
		const organization = yield* (await webappTrpc.organization.get.query({
			actor,
			slug: providedOrganizationSlug,
		})).safeUnwrap();

		if (organization === null) {
			return err(
				new Error(
					`Organization with slug ${providedOrganizationSlug} not found`,
				),
			);
		}

		const organizationMember =
			yield* (await webappTrpc.organizationMember.getForUser.query({
				actor,
				organization: {
					id: organization._id,
				},
				user: {
					id: actor.data.id,
				},
			})).safeUnwrap();

		if (organizationMember === null) {
			return err(
				new Error(
					`User is not a member of organization with slug ${providedOrganizationSlug}`,
				),
			);
		}

		return $ok({
			organizationMember: {
				_id: organizationMember._id,
				organization,
			},
		});
	}

	const organizationMembers =
		yield* (await webappTrpc.organizationMember.list$organizationData.query({
			actor,
			user: {
				id: actor.data.id,
			},
			includeProjectGuests: true,
		})).safeUnwrap();

	// If the user doesn't belong to an existing organization, we automatically create one for them
	if (organizationMembers.length === 0) {
		const user = yield* (await webappTrpc.user.get.query({
			actor,
			user: {
				id: actor.data.id,
			},
		})).safeUnwrap();

		if (user === null) {
			return err(new DocumentNotFoundError('User'));
		}

		const organizationSlug = `${
			user.fullName
				.toLowerCase()
				.replaceAll(/\W/g, '-')
		}-organization-${randomInteger(1, 100)}`;
		const organizationName = `${user.fullName}'s organization`;
		const { doc: organization, ownerOrganizationMemberId } =
			yield* (await webappTrpc.organization.create.mutate({
				actor,
				metadata: {
					ownerRole: null,
					size: null,
				},
				name: organizationName,
				ownerUser: {
					id: actor.data.id,
				},
				slug: organizationSlug,
			})).safeUnwrap();

		return $ok({
			organizationMember: {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
				_id: ownerOrganizationMemberId!,
				organization: {
					_id: organization._id,
					name: organizationName,
					slug: organizationSlug,
				},
			},
		});
	}

	// If the user only has one organization, we automatically assume they want to use this organization
	if (
		organizationMembers.length === 1 &&
		organizationMembers[0] !== undefined
	) {
		return $ok({
			organizationMember: organizationMembers[0],
		});
	}

	process.stdout.write(
		chalk.magentaBright.bold(
			'🌐 Select the organization you want to use for your app:\n\n',
		),
	);

	const select = new SelectPrompt({
		options: [
			...organizationMembers.map(({ organization }) => ({
				value: organization._id,
				name: organization.name,
				slug: organization.slug,
			})),
			{
				value: 'CREATE_NEW_ORGANIZATION',
				name: 'Create new organization',
				slug: '',
			},
		],
		render() {
			return this.options
				.map((option) => {
					if (option.value === this.value) {
						return chalk.cyan(
							outdent`
								❯ ${option.name} ${chalk.dim(option.slug)}
							`,
						);
					} else {
						return `${chalk.hidden('❯')} ${option.name} ${
							chalk.dim(
								option.slug,
							)
						}`;
					}
				})
				.join('\n');
		},
	});

	const organizationId = await select.prompt();
	if (isCancel(organizationId)) {
		return err(new Error('Cancelled'));
	}

	if (organizationId === 'CREATE_NEW_ORGANIZATION') {
		const { organization, organizationMember } =
			yield* promptCreateOrganization({ actor }).safeUnwrap();
		return $ok({
			organizationMember: {
				_id: organizationMember._id,
				organization,
			},
		});
	}

	return $ok({
		organizationMember:
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
			organizationMembers.find(
				(organizationMember) =>
					organizationMember.organization._id === organizationId,
			)!,
	});
}));

export const promptCreateOrganization = (
	{ actor }: { actor: Actor<'User'> },
) => ($try(async function*(
	$ok: TryOk<{
		organization: {
			_id: Id<'Organization'>;
			name: string;
			slug: string;
		};
		organizationMember: { _id: Id<'OrganizationMember'> };
	}>,
) {
	const organizationNamePrompt = new TextPrompt({
		render() {
			return `${
				chalk.magentaBright.bold(
					`🌐 Give your new organization a name: ${chalk.reset.dim('›')} `,
				)
			}${this.valueWithCursor}`;
		},
	});

	const organizationName = await organizationNamePrompt.prompt();
	const organizationSlug = `${
		String(organizationName)
			.toLowerCase()
			.replaceAll(/\W/g, '-')
	}-${randomInteger(1, 10_000)}`;

	if (isCancel(organizationName)) {
		return err(new Error('Cancelled'));
	}

	process.stdout.write('\n');

	const { webappTrpc } = await getWebappTrpc();
	const { doc: organization, ownerOrganizationMemberId } =
		yield* (await webappTrpc.organization.create.mutate({
			actor,
			metadata: {
				ownerRole: null,
				size: null,
			},
			name: organizationName,
			ownerUser: {
				id: actor.data.id,
			},
			slug: organizationSlug,
		})).safeUnwrap();

	return $ok({
		organization,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		organizationMember: { _id: ownerOrganizationMemberId! },
	});
}));
