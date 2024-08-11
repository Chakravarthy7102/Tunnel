import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { select } from '@-/client-doc';
import { ToolbarCommentButton } from './buttons/comment.js';
import { ToolbarInstantReplayButton } from './buttons/instant-replay.tsx';
import { ToolbarRecordButton } from './buttons/record.tsx';

export function CommentActions({
	context,
}: {
	context: PageToolbarContext<{
		hasProject: true;
		actorType: 'User';
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);
	const project = select(
		state,
		'Project',
		state.projectId,
	);

	return (
		<>
			{project.isSessionRecordingEnabled && (
				<>
					<ToolbarRecordButton context={context} />
					{!state.isRecording &&
						<ToolbarInstantReplayButton context={context} />}
				</>
			)}
			{!state.isRecording && <ToolbarCommentButton context={context} />}
		</>
	);
}
