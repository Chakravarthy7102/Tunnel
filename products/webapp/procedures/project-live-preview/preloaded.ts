import { WebappApiInput } from '#api-input';
import type { NonNullPreloaded } from '#types';
import { defineProcedure } from '#utils/procedure.ts';
import type { ClientDoc } from '@-/client-doc';
import { ApiConvex } from '@-/convex/api';
import { jsonToConvex } from '@-/convex/values';
import type { api } from '@-/database';
import { getVapi } from '@-/database/vapi';
import { env } from '@-/env';
import {
	DocumentNotFoundError,
	InsufficientPermissionsError,
	isError,
	ProcedureError,
} from '@-/errors';
import { logger } from '@-/logger';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiOrganizationMember } from '@-/organization-member/api';
import { ApiUser } from '@-/user/api';
import { z } from '@-/zod';
import Ably from 'ably/promises.js';
import { err, ok, ResultAsync } from 'errok';
import onetime from 'onetime';
import pProps from 'p-props';

export const projectLivePreview_getPreloadedRelations$tunnelInstancePageToolbarDataWithRelations =
	defineProcedure({
		input: WebappApiInput.withActor(
			'User',
			(actor, { input, ctx }) =>
				z.object({
					user: WebappApiInput.user({
						actor,
						actorRelation: 'actor',
					})(input, ctx),
					project: WebappApiInput.project({
						actor,
						actorOrganizationMemberRole:
							OrganizationMemberRoleInput.guestOrHigher,
					})(input, ctx).nullable(),
					projectLivePreview: WebappApiInput.projectLivePreview({
						identifier: 'id',
						actor,
						actorRelation: 'hasPermission',
					})(input, ctx).nullable(),
				}),
		),
		async query({ input }) {
			const vapi = await getVapi();

			const getProjectLivePreviewData = onetime(async () => {
				if (input.projectLivePreview === null) {
					return ok(null);
				}

				if (input.projectLivePreview.isErr()) {
					if (isError(input.projectLivePreview.error, DocumentNotFoundError)) {
						return ok(null);
					}

					return err(input.projectLivePreview.error);
				}

				const projectLivePreviewId = input.projectLivePreview.value;
				const projectLivePreviewDataResult = await ApiConvex.v
					.ProjectLivePreview.get(
						{
							from: { id: projectLivePreviewId },
							include: {
								project: {
									include: {
										organization: true,
									},
								},
								linkedTunnelInstanceProxyPreview: true,
							},
						},
					);

				if (projectLivePreviewDataResult.isErr()) {
					return err(projectLivePreviewDataResult.error);
				}

				return ok(projectLivePreviewDataResult.value);
			});

			return ok(
				await pProps({
					ablyTokenDetails: getAblyTokenDetails(),
					preloadedActorUser: getPreloadedActorUser(),
					preloadedActorOrganizationMember:
						getPreloadedActorOrganizationMember(),
					preloadedProject: getPreloadedProject(),
					preloadedProjectLivePreview: getPreloadedProjectLivePreview(),
					preloadedTunnelInstanceProxyPreview:
						getPreloadedTunnelInstanceProxyPreview(),
					botUser: getBotUser(),
				}),
			);

			async function getAblyTokenDetails() {
				if (input.user.isErr()) {
					return ok(null);
				}

				const userId = input.user.value;

				return ResultAsync.fromFunction(async () => {
					const ably = new Ably.Rest({ key: env('ABLY_API_KEY') });
					return ok(
						await ably.auth.requestToken({ clientId: userId }),
					);
				});
			}

			async function getPreloadedActorUser() {
				if (input.user.isErr()) {
					return err(input.user.error);
				}

				return ok(
					await ApiConvex.preloadProtectedQuery(
						vapi.v.User_get_profileData,
						{ from: { id: input.user.value } },
						{ token: null },
					),
				);
			}

			async function getPreloadedActorOrganizationMember() {
				const actorUserResult = await getPreloadedActorUser();
				if (actorUserResult.isErr()) {
					return ok(null);
				}

				const actorUser = jsonToConvex(actorUserResult.value._valueJSON) as
					| ClientDoc<'User'>
					| null;

				if (actorUser === null) {
					return ok(null);
				}

				const projectLivePreviewData = await getProjectLivePreviewData();
				if (
					projectLivePreviewData.isErr() ||
					projectLivePreviewData.value === null
				) {
					return ok(null);
				}

				const { organization } = projectLivePreviewData.value.project;
				const organizationMemberResult = await ApiConvex.v.OrganizationMember
					.get({
						from: {
							user: actorUser._id,
							organization: organization._id,
						},
						include: {},
					});

				if (organizationMemberResult.isErr()) {
					return err(organizationMemberResult.error);
				}

				if (organizationMemberResult.value === null) {
					// If the organization member doesn't exist for a demo organization, we automatically create them
					if (organization.isDemo) {
						const organizationMember = await ApiOrganizationMember.create({
							input: {
								data: {
									user: actorUser._id,
									organization: organization._id,
									role: 'member',
								},
								include: {},
							},
						});

						if (organizationMember.isErr()) {
							logger.error(
								'Failed to create organization member',
								organizationMember.error,
							);
						}
					}
				}

				const organizationMember = await ApiConvex.preloadProtectedQuery(
					vapi.v.OrganizationMember_get_commentsProviderData,
					{
						from: {
							user: actorUser._id,
							organization: organization._id,
						},
					},
					{ token: null },
				);

				if (jsonToConvex(organizationMember._valueJSON) === null) {
					return err(new InsufficientPermissionsError({ actorUser }));
				}

				return ok(
					organizationMember as NonNullPreloaded<
						typeof api.v.OrganizationMember_get_commentsProviderData
					>,
				);
			}

			async function getPreloadedProject() {
				if (input.project === null) {
					return ok(null);
				}

				if (input.project.isErr()) {
					return err(input.project.error);
				}

				return ok(
					await ApiConvex.preloadProtectedQuery(
						vapi.v.Project_get_tunnelInstancePageToolbarData,
						{
							from: {
								id: input.project.value,
							},
						},
						{ token: null },
					),
				);
			}

			async function getPreloadedProjectLivePreview() {
				const projectLivePreviewData = await getProjectLivePreviewData();
				if (
					projectLivePreviewData.isErr() ||
					projectLivePreviewData.value === null
				) {
					return ok(null);
				}

				return ok(
					await ApiConvex.preloadProtectedQuery(
						vapi.v.ProjectLivePreview_get_tunnelInstancePageToolbarData,
						{
							from: {
								id: projectLivePreviewData.value._id,
							},
						},
						{ token: null },
					),
				);
			}

			async function getPreloadedTunnelInstanceProxyPreview() {
				const projectLivePreviewData = await getProjectLivePreviewData();
				if (
					projectLivePreviewData.isErr() ||
					projectLivePreviewData.value === null
				) {
					return ok(null);
				}

				const { linkedTunnelInstanceProxyPreview } =
					projectLivePreviewData.value;

				return linkedTunnelInstanceProxyPreview === null ?
					ok(null) :
					ok(
						await ApiConvex.preloadProtectedQuery(
							vapi.v
								.TunnelInstanceProxyPreview_get_tunnelInstancePageToolbarData,
							{
								from: {
									id: linkedTunnelInstanceProxyPreview._id,
								},
							},
							{ token: null },
						),
					);
			}

			async function getBotUser() {
				const botUser = await ApiConvex.v.User.get({
					from: { username: 'tunnel-bot' },
					include: {},
				});

				if (botUser.isErr()) {
					return err(botUser.error);
				}

				if (botUser.value !== null) {
					return ok(botUser.value);
				}

				const createBotUserResult = await ApiUser.create({
					input: {
						isBotUser: true,
						data: {
							email: 'bot@tunnel.dev',
							fullName: 'Tunnel Bot',
							profileImageUrl: 'https://tunnel.dev/assets/images/logo.png',
							username: 'tunnel-bot',
						},
						include: {},
					},
				});

				if (createBotUserResult.isErr()) {
					return err(createBotUserResult.error);
				}

				return ok(createBotUserResult.value);
			}
		},
		error: ({ error }) =>
			new ProcedureError("Couldn't get project live preview", error),
	});
