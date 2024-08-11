'use client';

import type { ServerDoc } from '@-/database';
import type {
	Project_$dashboardPageData,
} from '@-/database/selections';
import { createContext, type Dispatch, type SetStateAction } from 'react';

export default createContext<{
	project: ServerDoc<typeof Project_$dashboardPageData>;
	setProject: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>>
	>;
}>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will be initialized
	null!,
);
