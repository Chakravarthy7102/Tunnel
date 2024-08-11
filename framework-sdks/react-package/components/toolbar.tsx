import { useEffect } from 'react';

export interface ToolbarProps {
	projectId: string;
	branch?: string;
}

export function TunnelToolbar({
	projectId,
	branch,
	...additionalProps
}: ToolbarProps) {
	useEffect(() => {
		const script = document.createElement('script');

		const src =
			'release' in additionalProps && additionalProps.release === null ?
				'https://tunnel.test/__tunnel/script.js' :
				'release' in additionalProps && additionalProps.release === 'staging' ?
				'https://staging.tunnel.dev/__tunnel/script.js' :
				'https://tunnel.dev/__tunnel/script.js';

		script.src = src;
		script.dataset.projectId = projectId;
		if (branch !== undefined) {
			script.dataset.branch = branch;
		}

		if ('release' in additionalProps && additionalProps.release !== null) {
			script.dataset.release = String(additionalProps.release);
		}

		script.async = true;

		document.body.append(script);

		return () => {
			script.remove();
		};
	}, []);

	return null;
}
