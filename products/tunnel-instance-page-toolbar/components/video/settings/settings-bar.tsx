import { VideoSettingsButton } from '#components/dialogs/triggers/video-settings-button.tsx';
import type { PageToolbarContext } from '#types';
import { Button } from '@-/design-system/v1';
import { useDaily, useLocalParticipant } from '@daily-co/daily-react';
import { LogOut, Mic, MicOff, Settings, Video, VideoOff } from 'lucide-react';

export function SettingsBar({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasProjectLivePreview: true;
	}>;
}) {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion --- will be fixed
	const daily = useDaily()!;
	const participant = useLocalParticipant();

	const muteUser = () => null; /* state.dailyCallObject.setLocalAudio(false); */
	const unmuteUser = () =>
		null; /* state.dailyCallObject.setLocalAudio(true); */

	const hideVideo = () =>
		null; /* state.dailyCallObject.setLocalVideo(false); */
	const showVideo = () => null; /* state.dailyCallObject.setLocalVideo(true); */

	const leaveVideoCall = async () => {
		await daily.leave();
		context.store.setState({
			hasUserJoinedDailyRoom: false,
			isDailyLoading: false,
		});
	};

	return (
		<div className="h-10 w-full flex flex-row items-center justify-between bg-black rounded-b-[5px] px-1">
			<div className="flex flex-row justify-center items-center h-full gap-2 text-foreground">
				{participant?.tracks.audio.state === 'playable' ?
					(
						<Button
							size="icon"
							onClick={async () => {
								muteUser();
							}}
							variant="ghost"
						>
							<Mic size={16} />
						</Button>
					) :
					(
						<Button
							size="icon"
							onClick={async () => {
								unmuteUser();
							}}
							variant="destructive"
						>
							<MicOff size={16} />
						</Button>
					)}

				{participant?.tracks.video.state === 'playable' ?
					(
						<Button
							size="icon"
							variant="ghost"
							onClick={async () => {
								hideVideo();
							}}
						>
							<Video size={16} />
						</Button>
					) :
					(
						<Button
							size="icon"
							onClick={async () => {
								showVideo();
							}}
							variant="destructive"
						>
							<VideoOff size={16} />
						</Button>
					)}

				<VideoSettingsButton size="icon" variant="ghost" context={context}>
					<Settings size={16} />
				</VideoSettingsButton>
			</div>
			<div className="flex flex-row justify-center items-center h-full">
				<Button
					size="icon"
					variant="destructive"
					onClick={async () => {
						await leaveVideoCall();
					}}
				>
					<LogOut size={16} />
				</Button>
			</div>
		</div>
	);
}
