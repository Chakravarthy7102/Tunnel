import Script from 'next/script';
import React from 'react';

export interface ToolbarProps {
	projectId: string;
	branch?: string;
}

export function TunnelToolbar({
	projectId,
	branch,
	...additionalProps
}: ToolbarProps) {
	const src = 'release' in additionalProps && additionalProps.release === null ?
		'https://tunnel.test/__tunnel/script.js' :
		'release' in additionalProps && additionalProps.release === 'staging' ?
		'https://staging.tunnel.dev/__tunnel/script.js' :
		'https://tunnel.dev/__tunnel/script.js';

	const scriptProps = {
		src,
		'data-project-id': projectId,
		'data-branch': branch,
		...('release' in additionalProps ?
			{ 'data-release': additionalProps.release ?? 'development' } :
			{}),
	};

	return <Script strategy="afterInteractive" {...scriptProps} />;
}
