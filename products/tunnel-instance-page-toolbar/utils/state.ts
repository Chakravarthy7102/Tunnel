import type { PageToolbarContext } from '#types';
import { getPageToolbarSecretStorage } from '#utils/storage.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import { type ClientDoc, createDoc } from '@-/client-doc';
import { jsonToConvex } from '@-/convex/values';
import { type EmptySelection, type Id } from '@-/database';
import type { Project_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { InsufficientPermissionsError, isError } from '@-/errors';
import { type HostEnvironment, HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { toast } from '@-/tunnel-error';
import path from 'pathe';
import {
	isContext,
	useContextStore,
	useGetUserLocalWorkspace,
} from './context/_.ts';

export function useInitializeToolbarState(
	{ context }: { context: PageToolbarContext },
) {
	const getUserLocalWorkspace = useGetUserLocalWorkspace();
	const state = useContextStore(context);

	function getUserActor(): Actor | null {
		const pageToolbarSecretStorage = getPageToolbarSecretStorage();
		const { actorUserId } = pageToolbarSecretStorage.getSync();

		// dprint-ignore
		return actorUserId === null ? null : {
			data: {
				id: actorUserId,
			},
			type: 'User',
		} as Actor<'User'>;
	}

	async function initializeWrapperCommandState(
		{ userActor, context }: {
			userActor: Actor;
			context: PageToolbarContext<
				{
					hostnameType: 'local';
					hostEnvironmentType: HostEnvironmentType.wrapperCommand;
				}
			>;
		},
	) {
		const hostEnvironment = context.hostEnvironment as HostEnvironment<
			HostEnvironmentType.wrapperCommand
		>;
		const relativeDirpath = path.relative(
			hostEnvironment.localProjectEnvironment.rootDirpath,
			hostEnvironment.localProjectEnvironment.workingDirpath,
		);

		const { localProjectEnvironment } = hostEnvironment;
		const { providedProjectId } = localProjectEnvironment;

		const userLocalWorkspace = await getUserLocalWorkspace({
			providedProjectId,
			actorUserId: userActor.data.id,
			context,
			relativeDirpath,
		});

		if (userLocalWorkspace !== null) {
			const createProjectAction = createDoc.action(
				'Project',
				(create) =>
					create<typeof Project_$tunnelInstancePageToolbarData>(
						userLocalWorkspace.project,
					),
			);

			context.store.setState((state) => {
				state = createProjectAction(state);
				return {
					...state,
					projectId: userLocalWorkspace.project._id,
				};
			});
		}
	}

	return async function initializeToolbarState(
		{
			projectLivePreviewId,
			projectId,
		}: {
			projectLivePreviewId: Id<'ProjectLivePreview'> | null;
			projectId: Id<'Project'> | null;
		},
	) {
		const userActor = getUserActor();
		context.store.setState({ actor: userActor });

		if (userActor === null) {
			return;
		}

		// If the user is using the wrapper command, we attempt to retrieve the active local workspace from the local proxy server's state
		if (
			isContext(context, state, {
				hostEnvironmentType: HostEnvironmentType.wrapperCommand,
				hostnameType: 'local',
			})
		) {
			await initializeWrapperCommandState({ context, userActor });
		}

		// @ts-expect-error: todo
		const { webappTrpc } = getWebappTrpc({ context });
		const {
			ablyTokenDetails,
			preloadedActorUser,
			preloadedActorOrganizationMember,
			preloadedProject,
			preloadedProjectLivePreview,
			preloadedTunnelInstanceProxyPreview,
			botUser,
		} = (await webappTrpc.projectLivePreview
			.getPreloadedRelations$tunnelInstancePageToolbarDataWithRelations.query(
				{
					actor: userActor,
					user: {
						id: userActor.data.id,
					},
					project: projectId === null ? null : {
						id: projectId,
					},
					projectLivePreview: projectLivePreviewId === null ? null : {
						id: projectLivePreviewId,
					},
				},
			)).unwrapOrThrow();

		if (preloadedActorUser.isErr()) {
			logger.error('Failed to get actor user', preloadedActorUser.error);
			return;
		}

		if (preloadedActorOrganizationMember.isErr()) {
			logger.error(
				'Failed to get organization member',
				preloadedActorOrganizationMember.error,
			);
			return;
		}

		const actorUser = jsonToConvex(
			preloadedActorUser.value._valueJSON,
		) as ClientDoc<'User'> | null;

		const actorOrganizationMember =
			preloadedActorOrganizationMember.value === null ? null : jsonToConvex(
				preloadedActorOrganizationMember.value._valueJSON,
			) as ClientDoc<'OrganizationMember'> | null;

		const createActorUserAction = actorUser === null ?
			null :
			createDoc.action(
				'User',
				(create) => create<EmptySelection<'User'>>(actorUser),
			);

		// If `preloadedActorOrganizationMember` is null, it means that the user is not a member of the organization that owns the project
		if (
			actorUser !== null &&
			(
				(
					preloadedActorOrganizationMember.isErr() &&
					isError(
						preloadedActorOrganizationMember.error,
						InsufficientPermissionsError,
					)
				) || (
					preloadedProject.isErr() &&
					isError(
						preloadedProject.error,
						InsufficientPermissionsError,
					)
				)
			)
		) {
			context.store.setState((state) => {
				if (createActorUserAction !== null) {
					state = createActorUserAction(state);
				}

				return {
					...state,
					actor: {
						data: {
							id: actorUser._id,
						},
						type: 'User',
					},
					hasInsufficientPermissions: true,
				};
			});

			setTimeout(() => {
				toast.error(
					"This account does not have sufficient permissions to comment on this preview; make sure you're signed into the correct account.",
				);
			}, 200);

			return;
		}

		const createBotUserAction = (() => {
			if (botUser.isErr()) {
				logger.error('Failed to get bot user', botUser.error);
				return null;
			}

			return createDoc.action(
				'User',
				(create) => create<EmptySelection<'User'>>(botUser.value),
			);
		})();

		context.store.setState((state) => {
			if (createBotUserAction !== null) {
				state = createBotUserAction(state);
			}

			if (createActorUserAction !== null) {
				state = createActorUserAction(state);
			}

			return {
				...state,
				ablyTokenDetails: ablyTokenDetails.unwrapOr(null),
				actor: actorUser === null ? null : {
					data: {
						id: actorUser._id,
					},
					type: 'User',
				},
				actorOrganizationMemberId: actorOrganizationMember?._id ?? null,
				$preloaded: {
					...state.$preloaded,
					actorOrganizationMember: preloadedActorOrganizationMember.unwrapOr(
						null,
					),
					actorUser: preloadedActorUser.unwrapOr(null),
					project: preloadedProject.unwrapOr(null),
					projectLivePreview: preloadedProjectLivePreview.unwrapOr(null),
					tunnelInstanceProxyPreview: preloadedTunnelInstanceProxyPreview
						.unwrapOr(null),
				},
			};
		});
	};
}
