import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$tunneledServiceEnvironmentData,
	Project_$tunneledServiceEnvironmentData,
	TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData,
} from '@-/database/selections';

export const ProjectLivePreview_$tunneledServiceEnvironmentData =
	defineSelection('ProjectLivePreview', () => ({}));

export const ProjectLivePreview_$recursiveTunneledServiceEnvironmentData =
	defineSelection('ProjectLivePreview', () => ({
		linkedTunnelInstanceProxyPreview: {
			include: getInclude(
				TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData,
			),
		},
		project: {
			include: getInclude(
				Project_$tunneledServiceEnvironmentData,
			),
		},
		organization: {
			include: getInclude(
				Organization_$tunneledServiceEnvironmentData,
			),
		},
	}));
