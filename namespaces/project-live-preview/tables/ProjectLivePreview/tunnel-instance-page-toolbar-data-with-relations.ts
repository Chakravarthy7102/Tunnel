import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Project_$tunnelInstancePageToolbarData,
	ProjectLivePreview_$tunnelInstancePageToolbarData,
	TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectLivePreview_$tunnelInstancePageToolbarDataWithRelations =
	defineSelection('ProjectLivePreview', () => (deepmerge(
		getInclude(ProjectLivePreview_$tunnelInstancePageToolbarData),
		{
			project: {
				include: getInclude(Project_$tunnelInstancePageToolbarData),
			},
			linkedTunnelInstanceProxyPreview: {
				include: getInclude(
					TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
				),
			},
		},
	)));
