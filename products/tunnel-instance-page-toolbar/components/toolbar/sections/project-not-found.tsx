import type { PageToolbarContext } from '#types';
import { Button } from '@-/design-system/v1';
import { X } from 'lucide-react';
import { useState } from 'react';

export function MissingDataProjectId(_args: { context: PageToolbarContext }) {
	const [show, setShow] = useState(true);

	if (show) {
		return (
			<div className="text-white p-4 fixed bottom-4 right-4 z-[1000] bg-background border border-solid border-border rounded-[5px]">
				<h1 className="font-bold">
					Missing <code>data-project-id</code>
				</h1>
				<p className="text-xs text-gray-400">
					Make sure your Tunnel &lt;script&gt; tag contains your project ID in a
					{' '}
					<code>data-project-id</code> attribute.
				</p>
				<Button
					variant="ghost"
					size="icon"
					className="top-1 right-1 absolute"
					onClick={() => setShow(false)}
				>
					<X size={12} className="text-muted-foreground" />
				</Button>
			</div>
		);
	}

	return null;
}

export function ProjectNotFound({
	_context,
	projectId,
}: {
	_context: PageToolbarContext;
	projectId: string;
}) {
	const [show, setShow] = useState(true);

	if (show) {
		return (
			<div className="text-white p-4 fixed bottom-4 right-4 z-[1000] bg-background border border-solid border-border rounded-[5px]">
				<h1 className="font-bold">Project not found</h1>
				<p className="text-xs text-muted-foreground">
					We were unable to find a project with ID <code>{projectId}</code>
				</p>
				<Button
					variant="ghost"
					size="icon"
					className="top-1 right-1 absolute"
					onClick={() => setShow(false)}
				>
					<X size={12} className="text-muted-foreground" />
				</Button>
			</div>
		);
	}

	return null;
}
