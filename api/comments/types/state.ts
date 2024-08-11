import type { Actor } from '@-/actor';
import type { AnyCollections } from '@-/client-doc';
import type { Id } from '@-/database';
import type { HostEnvironmentType } from '@-/host-environment';

export type CommentsAction<$State = CommentsState> = (state: $State) => $State;

export interface CommentsState {
	$collections: AnyCollections;
	$pendingActions: Array<{ action: CommentsAction; id: number }>;
	$nextPendingActionId: number;

	userActor: Actor<'User'>;
	actorUserId: Id<'User'>;
	actorOrganizationMemberId:
		| Id<'OrganizationMember'>
		| null;

	commentThreadIds: Id<'ProjectCommentThread'>[];
	filteredProjectCommentThreadIds: Id<'ProjectCommentThread'>[];

	container: HTMLElement | null;
	shadowRoot: ShadowRoot | null;
	focusedCommentThreadId:
		| Id<'ProjectCommentThread'>
		| null;
	activeCommentThreadId:
		| Id<'ProjectCommentThread'>
		| null;
	currentResolvedCommentThreadIds: Id<'ProjectCommentThread'>[];

	hostEnvironmentType: HostEnvironmentType;
}
