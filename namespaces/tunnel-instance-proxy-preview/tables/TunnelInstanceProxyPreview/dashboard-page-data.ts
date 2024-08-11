import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	TunnelInstanceProxyPreview_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const TunnelInstanceProxyPreview_$dashboardPageData = defineSelection(
	'TunnelInstanceProxyPreview',
	() =>
		deepmerge(
			getInclude(TunnelInstanceProxyPreview_$commentsProviderData),
			{
				projectLivePreviews: true,
				project: {
					include: {
						organization: true,
					},
				},
			} as const,
		),
);
