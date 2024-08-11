import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useOnceEffect } from '#utils/effect.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { updateDoc } from '@-/client-doc';
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@-/design-system/v1';
import { logger } from '@-/logger';
import { toast } from '@-/tunnel-error';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import arrayUnique from 'array-uniq';
import { useState } from 'react';

export function PortProxyingPermissionPrompts({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasTunnelInstanceProxyPreview: true;
		hasProjectLivePreview: true;
		isOnline: true;
	}>;
}) {
	const [promptedPortNumbers, setPromptedPortNumbers] = useState<number[]>([]);
	const { webappTrpc } = getWebappTrpc({ context });
	const tunnelGlobals = getTunnelGlobals();
	const state = useContextStore(context);

	if (!tunnelGlobals) {
		return null;
	}

	const { portProxying } = tunnelGlobals;

	useOnceEffect(() => {
		return portProxying.onPortProxyPrompt(({ portNumber }) => {
			setPromptedPortNumbers((portNumbers) => [...portNumbers, portNumber]);
		});
	});

	const shadowRootElement = useShadowRootElement();

	if (promptedPortNumbers.length === 0) {
		return null;
	}

	return (
		<Dialog
			open={promptedPortNumbers.length > 0}
			onOpenChange={(open) => {
				if (!open) {
					setPromptedPortNumbers([]);
				}
			}}
		>
			<DialogContent container={shadowRootElement}>
				<DialogHeader>
					<DialogTitle>Port Proxying</DialogTitle>
					<DialogDescription>
						A request was made to the following local ports
					</DialogDescription>
				</DialogHeader>
				<DialogBody>
					{promptedPortNumbers.map((portNumber) => (
						<div className="flex flex-row gap-4 items-center" key={portNumber}>
							<div className="text-foreground font-light">
								{portNumber}
							</div>
							<div className="flex flex-row justify-center items-center gap-2">
								<Button
									size="sm"
									variant="outline"
									onClick={async () => {
										const result = await webappTrpc.tunnelInstanceProxyPreview
											.addDisallowedPortNumber.mutate({
												actor: state.actor,
												portNumber,
												tunnelInstanceProxyPreview: {
													id: state.tunnelInstanceProxyPreviewId,
												},
											});

										if (result.isErr()) {
											toast.procedureError(result);
											return;
										}

										context.store.setState(updateDoc.action(
											'TunnelInstanceProxyPreview',
											state.tunnelInstanceProxyPreviewId,
											(tunnelInstanceProxyPreview) => ({
												...tunnelInstanceProxyPreview,
												disallowedPortNumbers: arrayUnique([
													...tunnelInstanceProxyPreview.disallowedPortNumbers,
													portNumber,
												]),
											}),
										));

										const proxyPromptActions = portProxying
											.portNumberToProxyPromptActions.get(
												portNumber,
											);

										if (proxyPromptActions !== undefined) {
											proxyPromptActions.disallow();
										} else {
											logger.warn(
												`Proxy prompt actions for port ${portNumber} not found`,
											);
										}

										setPromptedPortNumbers(
											promptedPortNumbers.filter((port) =>
												port !== portNumber
											),
										);
									}}
								>
									Deny
								</Button>
								<Button
									size="sm"
									variant="blue"
									onClick={async () => {
										(await webappTrpc.tunnelInstanceProxyPreview
											.addAllowedPortNumber.mutate(
												{
													actor: state.actor,
													portNumber,
													tunnelInstanceProxyPreview: {
														id: state.tunnelInstanceProxyPreviewId,
													},
												},
											)).unwrapOrThrow();

										context.store.setState(updateDoc.action(
											'TunnelInstanceProxyPreview',
											state.tunnelInstanceProxyPreviewId,
											(tunnelInstanceProxyPreview) => ({
												...tunnelInstanceProxyPreview,
												allowedPortNumbers: arrayUnique([
													...tunnelInstanceProxyPreview.allowedPortNumbers,
													portNumber,
												]),
											}),
										));

										const proxyPromptActions = portProxying
											.portNumberToProxyPromptActions.get(
												portNumber,
											);

										if (proxyPromptActions !== undefined) {
											proxyPromptActions.allow();
										} else {
											logger.warn(
												`Proxy prompt actions for port ${portNumber} not found`,
											);
										}

										setPromptedPortNumbers(
											promptedPortNumbers.filter((port) => port !== portNumber),
										);
									}}
								>
									Allow
								</Button>
							</div>
						</div>
					))}
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
