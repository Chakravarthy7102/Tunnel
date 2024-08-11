import { useOnceEffect } from '#utils/effect.ts';
import { useState } from 'react';

// Makes sure that the code is only run on the client
export function useClient() {
	const [isClient, setIsClient] = useState(false);
	useOnceEffect(() => {
		setIsClient(true);
	});

	return {
		isClient,
	};
}
