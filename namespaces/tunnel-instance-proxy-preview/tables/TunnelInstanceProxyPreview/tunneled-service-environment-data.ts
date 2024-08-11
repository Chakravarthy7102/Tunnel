import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Organization_$tunneledServiceEnvironmentData,
	Project_$tunneledServiceEnvironmentData,
	ProjectLivePreview_$tunneledServiceEnvironmentData,
} from '@-/database/selections';

export const TunnelInstanceProxyPreview_$tunneledServiceEnvironmentData =
	defineSelection(
		'TunnelInstanceProxyPreview',
		() => ({}),
	);

export const TunnelInstanceProxyPreview_$recursiveTunneledServiceEnvironmentData =
	defineSelection('TunnelInstanceProxyPreview', () => ({
		project: {
			include: getInclude(Project_$tunneledServiceEnvironmentData),
		},
		organization: {
			include: getInclude(
				Organization_$tunneledServiceEnvironmentData,
			),
		},
		projectLivePreviews: {
			include: getInclude(
				ProjectLivePreview_$tunneledServiceEnvironmentData,
			),
		},
	}));
