import type {
	CreatePageToolbarContextArgs,
	NarrowPageToolbarContextArgs,
	VideoBubbleState,
} from '#types';
import { createVideoBubbleState } from '#utils/state/video-bubble.ts';
import type { Id } from '@-/database';
// import DailyIframe, { type DailyCall } from '@daily-co/daily-js';
import {
	defineProperties,
	type IfExtends,
	type NullProperties,
} from '@tunnel/context';
import type { Types } from 'ably';

interface ProjectLivePreviewProperties {
	ablyTokenDetails: Types.TokenDetails;
	isShareDialogOpen: boolean;
	isSettingsDialogOpen: boolean;
	// dailyCallObject: DailyCall;
	hasUserJoinedDailyRoom: boolean;
	isDailyLoading: boolean;
	isVideoSettingsOpen: boolean;
	projectLivePreviewId: Id<'ProjectLivePreview'>;
	videoBubble: VideoBubbleState;
	liveshareLink: string | null;
	session: {
		thumbnail: File | null;
		events: any[];
	};
}

// Defined in the Global scope to ensure it only gets created once
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- bad typings
// const dailyCallObject = (DailyIframe.default ?? DailyIframe).createCallObject();

// dprint-ignore
type ContextProjectLivePreviewProperties<
	$Args extends NarrowPageToolbarContextArgs = NarrowPageToolbarContextArgs
> =
	IfExtends<true, $Args['hasProjectLivePreview'], ProjectLivePreviewProperties> |
	IfExtends<
		false,
		$Args['hasProjectLivePreview'],
		NullProperties<ProjectLivePreviewProperties>
	>;

/**
	Information about the active tunnel instance (might be null if the user has not associated it with a tunnel instance)
*/
export function createProjectLivePreviewProperties<
	$Args extends NarrowPageToolbarContextArgs,
>(
	_args: CreatePageToolbarContextArgs,
): ContextProjectLivePreviewProperties<$Args> {
	return defineProperties<ContextProjectLivePreviewProperties>({
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will be non-null
		ablyTokenDetails: null!,
		isShareDialogOpen: false,
		isSettingsDialogOpen: false,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- will be non-null
		projectLivePreviewId: null!,
		// dailyCallObject,
		hasUserJoinedDailyRoom: false,
		isDailyLoading: false,
		isVideoSettingsOpen: false,
		videoBubble: createVideoBubbleState(),
		liveshareLink: null,
		session: { thumbnail: null, events: [] },
	});
}
