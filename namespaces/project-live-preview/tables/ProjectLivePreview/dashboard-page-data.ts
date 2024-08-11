import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectLivePreview_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectLivePreview_$dashboardPageData = defineSelection(
	'ProjectLivePreview',
	() =>
		deepmerge(
			getInclude(ProjectLivePreview_$commentsProviderData),
			{
				linkedTunnelInstanceProxyPreview: true,
				project: {
					include: {
						organization: true,
					},
				},
			} as const,
		),
);
