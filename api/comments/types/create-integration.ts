import type { Id } from '@-/database';

export interface StandardIntegrationCreationParams {
	files: { _id: Id<'File'> }[];
	generatedTitlePromise: Promise<string>;
	text: string;
	tunnelUrl: string;
	commentThreadId: Id<'ProjectCommentThread'>;
}
