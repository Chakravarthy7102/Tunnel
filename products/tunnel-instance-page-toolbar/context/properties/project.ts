import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
} from '#types';
import type { JSONContent } from '@-/comments';
import type { Id } from '@-/database';

import type { JwtPayloads } from '@-/jwt';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';

interface ProjectProperties {
	activeCommentThreadId:
		| Id<'ProjectCommentThread'>
		| null;
	focusedCommentThreadId:
		| Id<'ProjectCommentThread'>
		| null;
	previousFocusedCommentThreadId:
		| Id<'ProjectCommentThread'>
		| null;
	commentThreadIds: Id<'ProjectCommentThread'>[];
	currentResolvedCommentThreadIds: Id<'ProjectCommentThread'>[];
	isCommentCursorVisible: boolean;
	isRecording: boolean;
	isInboxOpen: boolean;
	commentBoxPosition: {
		x: number;
		y: number;
	} | null;
	pendingNewCommentThread: null | {
		anchorElementXpath: string | null;
		xpathType: string;
		route: string;
		percentageTop: number;
		percentageLeft: number;
		content: JSONContent[];
		files: File[];
		fileUploads: {
			uploadResultJwt: string;
			uploadResult: JwtPayloads['file']['uploadResult'];
		}[];
		screenshot: Promise<File | null> | null;
	};
	dialogNewCommentThread: null | {
		anchorElementXpath: string | null;
		xpathType: string;
		route: string;
		percentageTop: number;
		percentageLeft: number;
		rawText: string;
		screenshot: File[];
		fileUploads: {
			uploadResultJwt: string;
			uploadResult: JwtPayloads['file']['uploadResult'];
		}[];
		session: {
			events: any[];
			thumbnail: File | null;
		};
	};
	pendingNewReply: null | {
		content: JSONContent[];
		files: File[];
		fileUploads: {
			uploadResultJwt: string;
			uploadResult: JwtPayloads['file']['uploadResult'];
		}[];
	};
	projectId: Id<'Project'>;
	expandedImageUrl: string | null;
}

// dprint-ignore
type ContextProjectProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<true, $Args['hasProject'], ProjectProperties> |
	IfExtends<
		false,
		$Args['hasProject'],
		NullProperties<ProjectProperties>
	>;

/**
	Information about the active tunnel instance (might be null if the user has not associated it with a tunnel instance)
*/
export function createProjectProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(_args: CreatePageToolbarContextArgs): ContextProjectProperties<$Args> {
	return defineProperties<ContextProjectProperties>({
		activeCommentThreadId: null,
		focusedCommentThreadId: null,
		previousFocusedCommentThreadId: null,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will be non-null
		projectId: null!,
		isCommentCursorVisible: false,
		isRecording: false,
		isInboxOpen: false,
		commentBoxPosition: null,
		pendingNewCommentThread: null,
		dialogNewCommentThread: null,
		pendingNewReply: null,
		expandedImageUrl: null,
		commentThreadIds: [],
		currentResolvedCommentThreadIds: [],
	});
}
