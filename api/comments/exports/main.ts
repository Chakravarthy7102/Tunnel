export { Comment } from '#components/comment.tsx';
export { ConsoleLogs } from '#components/console/console-logs.tsx';
export { EnvironmentDialogButton } from '#components/dialogs/environment-dialog-button.tsx';
export { ExpandableImage } from '#components/expandable-image.tsx';
export { FirstComment } from '#components/first-comment.tsx';
export { IntegrationActivity } from '#components/integration-activity.tsx';
export { MetadataCard } from '#components/metadata/metadata-card.tsx';
export { NetworkLogsTable } from '#components/network-logs/table.tsx';
export { NewThreadInput } from '#components/new-thread-input.tsx';
export { ThreadBadges } from '#components/thread-badges.tsx';
export {
	threadInputContainerVariants,
	threadInputPlateVariants,
} from '#components/thread-input-ui.tsx';
export { ProjectSelect } from '#components/thread-input/project-select.tsx';
export { ThreadPreviewCard } from '#components/thread-preview-card.tsx';
export { ThreadReplyInput } from '#components/thread-reply-input.tsx';
export { ToolbarNewThreadInput } from '#components/toolbar/toolbar-new-thread-input.tsx';
export { ToolbarReplyInput } from '#components/toolbar/toolbar-reply-input.tsx';
export { useComments } from '#hooks/comments.ts';
export { defineStateOperation } from '#utils/operation.ts';

export type {
	CommentsAction,
	CommentsContext,
	CommentsProviderProps,
	CommentsState,
} from '#types';
export interface JSONContent {
	type?: string;
	attrs?: Record<string, any>;
	content?: JSONContent[];
	marks?: {
		type: string;
		attrs?: Record<string, any>;
		[key: string]: any;
	}[];
	text?: string;
}
