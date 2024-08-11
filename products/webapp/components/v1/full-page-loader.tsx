'use client';

import { Transition } from '@headlessui/react';
import { useEffect, useState } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader.js';

export function FullPageLoader() {
	const [showTransition, setShowTransition] = useState<boolean>(false);

	useEffect(() => {
		setShowTransition(true);
	}, [setShowTransition]);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-[#15181E] px-6">
			<Transition
				show={showTransition}
				enter="transition-opacity duration-600"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				leave="transition-opacity duration-150"
				leaveFrom="opacity-100"
				leaveTo="opacity-0"
			>
				<div className="flex flex-col justify-center items-center w-full">
					<div className="relative mb-8 h-12">
						{/* <Image alt="Tunnel logo" src={WhiteLogo} layout="responsive" /> */}
					</div>
					<ScaleLoader
						height={40}
						color="#5267ff"
						width={5}
						radius={2}
						margin={2}
					/>
				</div>
			</Transition>
		</div>
	);
}
