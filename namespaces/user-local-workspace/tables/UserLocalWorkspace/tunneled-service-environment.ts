import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$tunneledServiceEnvironmentData,
	Project_$tunneledServiceEnvironmentData,
	ProjectLivePreview_$tunneledServiceEnvironmentData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const UserLocalWorkspace_$recursiveTunneledServiceEnvironmentData =
	defineSelection('UserLocalWorkspace', () => ({
		project: {
			include: deepmerge(getInclude(Project_$tunneledServiceEnvironmentData), {
				organization: {
					include: getInclude(
						Organization_$tunneledServiceEnvironmentData,
					),
				},
			}),
		},
		linkedTunnelInstanceProxyPreview: {
			include: {
				projectLivePreviews: {
					include: getInclude(
						ProjectLivePreview_$tunneledServiceEnvironmentData,
					),
				},
			},
		},
	}));
