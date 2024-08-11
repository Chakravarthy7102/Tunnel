'use client';

import type { ClientDoc } from '@-/client-doc';
import type { CommentsContext } from '@-/comments';
import {
	type ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import { createContext } from 'react';

export default createContext<{
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
	commentsContext: CommentsContext;
}>(
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be initialized
	null!,
);
