import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
	Notification,
	ToolbarState,
} from '#types';
import { createToolbarState } from '#utils/state/toolbar.ts';
import type { AnyCollections } from '@-/client-doc';
import type { Preloaded } from '@-/convex/react';
import type { api } from '@-/database';
import * as tables from '@-/database/tables';
import { defineProperties } from '@tunnel/context';
import mapObject from 'map-obj';

interface ContextGlobalProperties<
	_$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs,
> {
	$collections: AnyCollections;
	$pendingActions: any[];
	$nextPendingActionId: number;
	$preloaded: {
		projectCommentThreads:
			| Preloaded<
				typeof api.v.ProjectCommentThread_list_tunnelInstancePageToolbarData
			>
			| null;
		project:
			| Preloaded<typeof api.v.Project_get_tunnelInstancePageToolbarData>
			| null;
		projectLivePreview:
			| Preloaded<
				typeof api.v.ProjectLivePreview_get_tunnelInstancePageToolbarData
			>
			| null;
		tunnelInstanceProxyPreview:
			| Preloaded<
				typeof api.v.TunnelInstanceProxyPreview_get_tunnelInstancePageToolbarData
			>
			| null;
		actorUser: Preloaded<typeof api.v.User_get_profileData> | null;
		actorOrganizationMember:
			| Preloaded<typeof api.v.OrganizationMember_get_commentsProviderData>
			| null;
	};
	isCommandContextShowing: boolean;
	isServiceWorkerActive: boolean;
	commandModePoint: {
		x: number;
		y: number;
	} | null;
	isCodeOpen: boolean;
	isCommandModeOpen: boolean;
	isAuthLoading: boolean;
	isToolbarHidden: boolean;
	isLoading: boolean;
	hasInsufficientPermissions: boolean;
	notifications: Notification[];
	toolbar: ToolbarState;
	isMoreMenuOpen: boolean;
	isPortDialogOpen: boolean;
	isGithubDialogOpen: boolean;
	isCountingDown: boolean;
	viewAllProjectComments: boolean;
}

export function createGlobalProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(_args: CreatePageToolbarContextArgs): ContextGlobalProperties<$Args> {
	return defineProperties<ContextGlobalProperties>({
		$collections: mapObject(tables, (tableName) => [tableName, {}]),
		$preloaded: {
			projectCommentThreads: null,
			project: null,
			projectLivePreview: null,
			tunnelInstanceProxyPreview: null,
			actorUser: null,
			actorOrganizationMember: null,
		},
		$pendingActions: [],
		$nextPendingActionId: 0,
		isCommandContextShowing: false,
		commandModePoint: null,
		isCodeOpen: false,
		isCommandModeOpen: false,
		isAuthLoading: false,
		isToolbarHidden: false,
		isServiceWorkerActive: false,
		isLoading: true,
		toolbar: createToolbarState(),
		notifications: [],
		isMoreMenuOpen: false,
		isPortDialogOpen: false,
		isGithubDialogOpen: false,
		viewAllProjectComments: false,
		hasInsufficientPermissions: false,
		isCountingDown: false,
	});
}
