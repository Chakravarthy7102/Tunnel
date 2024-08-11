import { useContext, useEffect, useRef, useState } from 'react';

// import { PlayPauseOverlay } from './pause-overlay.tsx';
import { PlayerContext } from './player-context.tsx';

export function PlayerFrame({
	inDialog,
}: {
	inDialog: boolean;
}) {
	// const replayDimensionRef = useRef<viewportResizeDimension>();
	const replayDimensionRef = useRef<any>();
	const [firstRender, setFirstRender] = useState(true);

	const context = useContext(PlayerContext);

	if (!context) {
		// PlayerController must be wrapped by a Provider
		return null;
	}

	const {
		togglePlayPause,
		replayer,
		frame,
		skipping,
		setFrameRef,
	} = context;

	useEffect(() => {
		if (!replayer.current) {
			return;
		}

		replayer.current.on('resize', updatePlayerDimensions);
		window.addEventListener('resize', windowResize);

		return () => window.removeEventListener('resize', windowResize);
	}, [replayer.current]);

	const windowResize = () => {
		updatePlayerDimensions(replayDimensionRef.current);
	};

	// :TRICKY: Scale down the iframe and try to position it vertically
	const updatePlayerDimensions = (
		// replayDimensions: viewportResizeDimension | undefined,
		replayDimensions: any,
	) => {
		if (!replayDimensions || !frame) {
			return;
		}

		replayDimensionRef.current = replayDimensions;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		const { width, height } = frame.parentElement!.getBoundingClientRect();

		let scale = Math.min(
			width / replayDimensions.width,
			height / replayDimensions.height,
			1,
		);

		// On the first render, make the player frame 5% bigger
		if (firstRender && inDialog) {
			scale *= 1.05;
			setFirstRender(false);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		replayer.current!.wrapper.style.transform = `scale(${scale})`;
		frame.style.paddingLeft = `${
			(width - replayDimensions.width * scale) / 2
		}px`;
		frame.style.paddingTop = `${
			(height - replayDimensions.height * scale) / 2
		}px`;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		const replayerMouse = replayer.current!.wrapper.querySelector(
			'.replayer-mouse',
		);

		if (replayerMouse instanceof HTMLElement && inDialog) {
			replayerMouse.style.height = `${32 / scale}px`;
			replayerMouse.style.width = `${32 / scale}px`;
		}
	};

	return (
		<div className="ph-rrweb-player" onClick={togglePlayPause}>
			<div
				ref={(ref) => setFrameRef(ref)}
			/>
			<div className="ph-rrweb-overlay">
				{skipping && (
					<div className="ph-rrweb-skipping">
						Skipping inactivity...
					</div>
				)}

				{/* <PlayPauseOverlay playing={playing} /> */}
			</div>
		</div>
	);
}
