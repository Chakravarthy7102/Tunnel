import React from 'react';
export interface ToolbarProps {
	projectId: string;
	branch?: string;
	[key: string]: string | undefined;
}
export declare function TunnelToolbar(
	{ projectId, branch, ...additionalProps }: ToolbarProps,
): React.JSX.Element;
