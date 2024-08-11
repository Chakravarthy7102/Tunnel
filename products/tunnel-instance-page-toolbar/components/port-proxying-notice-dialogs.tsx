import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';
import { useShadowRoot } from '#utils/shadow-root.ts';
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@-/design-system/v1';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { useState } from 'react';

export function PortProxyingNoticeDialogs(_args: {
	context: PageToolbarContext<{
		hasTunnelInstanceProxyPreview: true;
		isOnline: true;
	}>;
}) {
	const [
		disallowedPortProxyingNoticePortNumber,
		setDisallowedPortProxyingNoticePortNumber,
	] = useState<number | null>(null);
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) {
		return null;
	}

	const { portProxying } = tunnelGlobals;

	useOnceEffect(() => {
		portProxying.onDisallowedPortProxyingNotice(({ portNumber }) => {
			setDisallowedPortProxyingNoticePortNumber(portNumber);
		});
	});

	const root = useShadowRoot();
	const rootNode: HTMLElement = root.getRootNode() as any;
	const shadowRootElement: HTMLElement = rootNode.firstChild as HTMLElement;

	return (
		<Dialog
			open={disallowedPortProxyingNoticePortNumber !== null}
			onOpenChange={(open) => {
				if (!open) {
					setDisallowedPortProxyingNoticePortNumber(null);
				}
			}}
		>
			<DialogContent container={shadowRootElement}>
				<DialogHeader>
					<DialogTitle>Proxying blocked</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<DialogDescription>
						The host has not allowed port{' '}
						{disallowedPortProxyingNoticePortNumber} to be proxied.
					</DialogDescription>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
