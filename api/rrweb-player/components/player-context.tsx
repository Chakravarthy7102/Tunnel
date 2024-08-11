import type { eventWithTime, playerMetaData } from '@rrweb/types';

import {
	createContext,
	forwardRef,
	type RefObject,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Replayer } from 'rrweb';
import { useDebouncedCallback } from 'use-debounce';

const JUMP_TIME_MS = 8000;
const PLAYBACK_SPEEDS = [0.5, 1, 2, 4, 8, 16];
const NOOP = () => {};

interface PlayerContextProps {
	replayer: RefObject<Replayer>;
	frame: HTMLDivElement | null;
	setFrameRef: (ref: HTMLDivElement | null) => void;
	wrapper: RefObject<HTMLDivElement> | null;
	timer: RefObject<number>;
	skipping: boolean;
	playing: boolean;
	currentTime: number;
	speed: number;
	meta: playerMetaData;
	isBuffering: boolean;
	setSkipping: (val: boolean) => void;
	setPlaying: (val: boolean) => void;
	setCurrentTime: (val: number) => void;
	onPlayerTimeChange: (val: number) => void;
	setSpeed: (val: number) => void;
	setMeta: (val: playerMetaData) => void;
	handleKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
	play: () => void;
	pause: () => void;
	togglePlayPause: () => void;
	seek: (
		time: number,
		{ forcePlay }?: { forcePlay?: boolean | undefined },
	) => void;
	seekBack: () => void;
	stopTimer: () => void;
	updateTime: () => void;
}

export const PlayerContext = createContext<PlayerContextProps | null>(null);

interface PlayerContextProviderProps {
	children: React.ReactNode;
	autoFocus: boolean;
	events: eventWithTime[];
	onPlayerTimeChange?: (playerTime: number) => void;
	onPrevious?: () => void; // Deprecated
	onNext?: () => void; // Deprecated
	isBuffering?: boolean;
	duration?: number; // in milliseconds
}

export interface PlayerRef {
	replayer: RefObject<Replayer | null>;
	seek: (playerTime: number) => void;
}

export const PlayerContextProvider = forwardRef<
	PlayerRef,
	PlayerContextProviderProps
>(function PlayerContextProvider(
	{
		children,
		events,
		onPlayerTimeChange,
		isBuffering = false,
		duration = 0,
		autoFocus,
	},
	ref,
) {
	// Implement player state in shared context

	const defaultTime = {
		startTime: events[0]?.timestamp ?? 0,
		endTime: (events[0]?.timestamp ?? 0) + duration,
		totalTime: duration,
	};

	const replayer = useRef<Replayer | null>(null);
	const [frame, setFrameRef] = useState<HTMLDivElement | null>(null); // useState here because this is set on consumer render
	const wrapper = useRef<HTMLDivElement | null>(null); // useState here because this is set on consumer render
	const timer = useRef<number | null>(null);
	const [playing, setPlaying] = useState(true);
	const [skipping, setSkipping] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [meta, setMeta] = useState<playerMetaData>(defaultTime);
	const [speed, setSpeed] = useState(1);

	const play = () => {
		setPlaying(true);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		replayer.current!.play(currentTime);
	};

	const pause = () => {
		setPlaying(false);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		replayer.current!.pause();
	};

	const togglePlayPause = () => {
		if (!playing && currentTime >= meta.totalTime) {
			seek(0, { forcePlay: true });
		} else if (playing) {
			pause();
		} else {
			play();
		}
	};

	const seek = (
		time: number,
		{ forcePlay }: { forcePlay?: boolean } = {},
	) => {
		time = Math.max(Math.min(time, meta.totalTime), 0);
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		replayer.current!.play(time);
		setCurrentTimeDebounced(time);
		onPlayerTimeChangeDebounced(time);
		setSkipping(false);
		if (!playing) {
			if (forcePlay) {
				setPlaying(true);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
				replayer.current!.pause();
			}
		}
	};

	const setCurrentTimeDebounced = useDebouncedCallback(setCurrentTime, 10, {
		maxWait: 100,
	}).callback;

	const onPlayerTimeChangeDebounced = useDebouncedCallback(
		onPlayerTimeChange ?? NOOP,
		300,
		{ maxWait: 1000 },
	).callback;

	useEffect(() => {
		if (frame) {
			stopTimer();

			replayer.current = new Replayer(events, {
				root: frame,
				skipInactive: true,
				triggerFocus: false,
				showWarning: false,
				speed,
				mouseTail: {
					duration: 400,
					lineCap: 'round',
					lineWidth: 3,
					strokeStyle: '#3b82f630',
				},
			});

			replayer.current.on('finish', pause);
			replayer.current.on('skip-start', () => setSkipping(true));
			replayer.current.on('skip-end', () => setSkipping(false));

			replayer.current.play();
			setPlaying(true);
			updateTime();

			if (!isBuffering) {
				const meta = replayer.current.getMetaData();
				setMeta(meta);
			}

			if (autoFocus) wrapper.current?.focus();
		}

		return () => {
			stopTimer();
			replayer.current?.pause();
		};
	}, [frame]);

	useEffect(() => {
		if (frame && replayer.current) {
			// Only add the events that don't already exist in replayer's context

			const currentEvents = replayer.current.service.state.context.events;
			const eventsToAdd = events.slice(currentEvents.length);
			for (const event of eventsToAdd) replayer.current.addEvent(event);

			// If player stopped playing because events were buffering, resume playing
			if (
				!playing &&
				currentTime >=
					(currentEvents.at(-1)?.timestamp ?? currentTime + 1)
			) {
				replayer.current.play();
				setPlaying(true);
			}

			if (!isBuffering) {
				const meta = replayer.current.getMetaData();
				setMeta(meta);
			}
		}
	}, [events.length]);

	useEffect((): any => {
		stopTimer();

		if (playing && meta.totalTime > 0) {
			updateTime();
			return () => stopTimer();
		}
	}, [playing, meta]);

	useEffect(() => {
		if (replayer.current) {
			replayer.current.setConfig({ speed });
		}
	}, [speed]);

	const stopTimer = () => {
		if (timer.current) {
			cancelAnimationFrame(timer.current);
		}
	};

	const updateTime = () => {
		if (replayer.current) {
			const currentTime = Math.min(
				replayer.current.getCurrentTime(),
				meta.totalTime,
			);
			setCurrentTimeDebounced(currentTime);
			onPlayerTimeChangeDebounced(currentTime);
		}

		timer.current = requestAnimationFrame(updateTime);
	};

	const handleKeyDown = (
		event: React.KeyboardEvent<HTMLDivElement>,
	): void => {
		if (event.key === ' ') {
			togglePlayPause();
			event.preventDefault();
		} else if (event.key === 'ArrowLeft') {
			seek(currentTime - JUMP_TIME_MS);
		} else if (event.key === 'ArrowRight') {
			seek(currentTime + JUMP_TIME_MS);
		} else {
			// Playback speeds shortcuts
			for (const [i, PLAYBACK_SPEED] of PLAYBACK_SPEEDS.entries()) {
				if (event.key === (i + 1).toString()) {
					setSpeed(PLAYBACK_SPEED);
				}
			}
		}
	};

	const seekBack = () => {
		seek(currentTime - JUMP_TIME_MS);
	};

	const value = useMemo(
		() => ({
			replayer,
			frame,
			setFrameRef,
			wrapper,
			timer,
			skipping,
			playing,
			currentTime,
			speed,
			meta,
			isBuffering,
			setSkipping,
			setPlaying,
			setCurrentTime: setCurrentTimeDebounced,
			onPlayerTimeChange: onPlayerTimeChangeDebounced,
			setSpeed,
			setMeta,
			handleKeyDown,
			play,
			pause,
			togglePlayPause,
			seek,
			seekBack,
			stopTimer,
			updateTime,
		}),
		[
			replayer,
			frame,
			setFrameRef,
			wrapper,
			timer,
			skipping,
			playing,
			currentTime,
			speed,
			meta,
			isBuffering,
			setSkipping,
			setPlaying,
			setCurrentTimeDebounced,
			onPlayerTimeChangeDebounced,
			setSpeed,
			setMeta,
			handleKeyDown,
			play,
			pause,
			togglePlayPause,
			seek,
			seekBack,
			stopTimer,
			updateTime,
		],
	);

	useImperativeHandle(ref, () => ({ replayer, seek }));

	return (
		<PlayerContext.Provider value={value}>
			<div
				ref={wrapper}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				style={{ height: 'auto', width: '100%' }}
			>
				{children}
			</div>
		</PlayerContext.Provider>
	);
});
