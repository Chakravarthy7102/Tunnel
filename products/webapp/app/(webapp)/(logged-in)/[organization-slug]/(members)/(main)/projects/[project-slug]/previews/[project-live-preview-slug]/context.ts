'use client';

import type { ServerDoc } from '@-/database';
import type { ProjectLivePreview_$dashboardPageData } from '@-/database/selections';
import { createContext } from 'react';

export default createContext<{
	projectLivePreview: ServerDoc<typeof ProjectLivePreview_$dashboardPageData>;
}>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will be initialized
	null!,
);
