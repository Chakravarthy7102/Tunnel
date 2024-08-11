import { formatTime } from '#utils/time.ts';
import {
	Button,
	Slider,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@-/design-system/v1';
import { useThrottle } from '@uidotdev/usehooks';
import { PauseCircle, PlayCircle } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { PlayerContext } from './player-context.tsx';

// const JUMP_TIME_MS = 8000;

export function PlayerController(): JSX.Element | null {
	const context = useContext(PlayerContext);
	if (!context) {
		// PlayerController must be wrapped by a Provider
		return null;
	}

	const {
		meta,
		seek,
		playing,
		togglePlayPause,
		pause,
		currentTime,
		isBuffering,
	} = context;

	const [sliderTime, setSliderTime] = useState<number | null>(null);
	const throttledSliderTime = useThrottle(sliderTime, 50);

	useEffect(() => {
		if (playing) {
			setSliderTime(null);
		}
	}, [playing]);

	useEffect(() => {
		if (throttledSliderTime !== null) {
			seek(throttledSliderTime);
		}
	}, [throttledSliderTime]);

	return (
		<div className="w-full flex justify-center items-center relative">
			<div className="flex flex-row justify-center items-center gap-x-6 w-full bg-secondary border border-solid border-border p-3 rounded-md rounded-t-none h-12">
				<div className="flex flex-row justify-center items-center gap-x-1">
					<Tooltip delayDuration={200}>
						<TooltipTrigger asChild>
							{playing ?
								(
									<Button variant="ghost" onClick={togglePlayPause}>
										<PauseCircle size={16} className="text-foreground" />
									</Button>
								) :
								(
									<Button
										variant="ghost"
										onClick={togglePlayPause}
									>
										<PlayCircle size={16} className="text-foreground" />
									</Button>
								)}
						</TooltipTrigger>
						<TooltipContent>
							{playing ? 'Pause' : 'Play'}
						</TooltipContent>
					</Tooltip>

					<div className="tabular-nums flex flex-row justify-center items-center gap-x-2 text-sm font-light">
						<span className="text-foreground">
							{formatTime(currentTime)}
						</span>
						<span className="text-muted-foreground">
							/
						</span>
						<span className="text-muted-foreground">
							{isBuffering ? '--:--:--' : formatTime(meta.totalTime)}
						</span>
					</div>
				</div>
				<div className="w-full">
					<Slider
						value={sliderTime === null ? [currentTime] : [sliderTime]}
						min={0}
						max={meta.totalTime}
						step={0.01}
						onValueChange={(time) => {
							if (playing) {
								pause();
							}

							setSliderTime(time[0] ?? 0);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
