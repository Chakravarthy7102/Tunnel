import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { select, updateDoc } from '@-/client-doc';
import {
	Button,
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Input,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { Minus, Network, Plus } from 'lucide-react';
import { useState } from 'react';

export function PortDialog({
	isOpen,
	setIsOpen,
	context,
}: {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
		hasTunnelInstanceProxyPreview: true;
		hasProjectLivePreview: true;
	}>;
}) {
	const shadowRootElement = useShadowRootElement();
	const state = useContextStore(context);

	const { webappTrpc } = getWebappTrpc({ context });
	const [addAllowedPortInput, setAddAllowedPortInput] = useState('');
	const [addDisallowedPortInput, setAddDisallowedPortInput] = useState('');

	const tunnelInstanceProxyPreview = select(
		state,
		'TunnelInstanceProxyPreview',
		state.tunnelInstanceProxyPreviewId,
	);

	const MAX_PORT_NUMBER = 65_535;
	const MIN_PORT_NUMBER = 1;

	const addAllowedPort = async () => {
		setAddAllowedPortInput('');

		const portNumber = Number(addAllowedPortInput);

		context.store.setState(updateDoc.action(
			'TunnelInstanceProxyPreview',
			state.tunnelInstanceProxyPreviewId,
			(tunnelInstanceProxyPreview) => ({
				...tunnelInstanceProxyPreview,
				allowedPortNumbers: [
					...tunnelInstanceProxyPreview.allowedPortNumbers,
					portNumber,
				],
			}),
		));

		(await webappTrpc.tunnelInstanceProxyPreview.addAllowedPortNumber.mutate({
			actor: state.actor,
			tunnelInstanceProxyPreview: {
				id: state.tunnelInstanceProxyPreviewId,
			},
			portNumber,
		})).unwrapOrThrow();
	};

	const removeAllowedPort = async ({ portNumber }: { portNumber: number }) => {
		context.store.setState(updateDoc.action(
			'TunnelInstanceProxyPreview',
			state.tunnelInstanceProxyPreviewId,
			(tunnelInstanceProxyPreview) => ({
				...tunnelInstanceProxyPreview,
				allowedPortNumbers: tunnelInstanceProxyPreview
					.allowedPortNumbers.filter(
						(allowedPortNumber) => allowedPortNumber !== portNumber,
					),
			}),
		));

		const result = await webappTrpc.tunnelInstanceProxyPreview
			.removeAllowedPortNumber.mutate(
				{
					actor: state.actor,
					tunnelInstanceProxyPreview: {
						id: state.tunnelInstanceProxyPreviewId,
					},
					portNumber,
				},
			);

		if (result.isErr()) {
			toast.procedureError(result);
		}
	};

	const addDisallowedPort = async () => {
		setAddDisallowedPortInput('');

		const portNumber = Number(addDisallowedPortInput);

		context.store.setState(updateDoc.action(
			'TunnelInstanceProxyPreview',
			state.tunnelInstanceProxyPreviewId,
			(tunnelInstanceProxyPreview) => ({
				...tunnelInstanceProxyPreview,
				disallowedPortNumbers: [
					...tunnelInstanceProxyPreview.disallowedPortNumbers,
					portNumber,
				],
			}),
		));

		const result = await webappTrpc.tunnelInstanceProxyPreview
			.addDisallowedPortNumber.mutate(
				{
					actor: state.actor,
					tunnelInstanceProxyPreview: {
						id: state.tunnelInstanceProxyPreviewId,
					},
					portNumber,
				},
			);

		if (result.isErr()) {
			toast.procedureError(result);
		}
	};

	const removeDisallowedPort = async ({
		portNumber,
	}: {
		portNumber: number;
	}) => {
		context.store.setState(updateDoc.action(
			'TunnelInstanceProxyPreview',
			state.tunnelInstanceProxyPreviewId,
			(tunnelInstanceProxyPreview) => ({
				...tunnelInstanceProxyPreview,
				disallowedPortNumbers: tunnelInstanceProxyPreview
					.disallowedPortNumbers.filter(
						(disallowedPortNumber) => disallowedPortNumber !== portNumber,
					),
			}),
		));

		(await webappTrpc.tunnelInstanceProxyPreview.removeDisallowedPortNumber
			.mutate(
				{
					actor: state.actor,
					tunnelInstanceProxyPreview: {
						id: state.tunnelInstanceProxyPreviewId,
					},
					portNumber,
				},
			)).unwrapOrThrow();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent
				container={shadowRootElement}
				className="w-full flex flex-col"
				onPointerDown={(e) => e.stopPropagation()}
			>
				<DialogHeader>
					<DialogTitle>Manage ports</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<div className="flex flex-col justify-start items-start text-white w-full gap-y-2">
						<div className="flex flex-col justify-center items-start w-full gap-1 bg-[#303030] border border-solid border-input p-4 rounded-[5px]">
							<p className="md:text-lg font-medium">Allowed</p>
							{tunnelInstanceProxyPreview.allowedPortNumbers.map(
								(allowedPortNumber) => (
									<div
										key={allowedPortNumber}
										className="flex flex-row items-center justify-between gap-x-1 w-full"
									>
										<div className="gap-x-2 flex flex-row justify-center items-center">
											<Network size={14} className="text-muted-foreground" />
											{allowedPortNumber}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={async () => {
												await removeAllowedPort({
													portNumber: allowedPortNumber,
												});
											}}
											className="h-8 w-8 p-0 min-w-[32px]"
										>
											<Minus size={14} className="text-red-500" />
										</Button>
									</div>
								),
							)}
							<div className="flex flex-row justify-between gap-x-2 items-center w-full">
								<Input
									className="w-full"
									type="number"
									value={addAllowedPortInput}
									inputMode="numeric"
									onChange={(e) => setAddAllowedPortInput(e.target.value)}
									placeholder="New allowed port"
								/>
								<Button
									onClick={addAllowedPort}
									size="icon"
									variant="ghost"
									className="h-8 w-8 p-0 min-w-[32px]"
									disabled={addAllowedPortInput.trim() === '' ||
										tunnelInstanceProxyPreview.allowedPortNumbers.includes(
											Number(addAllowedPortInput),
										) ||
										Number(addAllowedPortInput) > MAX_PORT_NUMBER ||
										Number(addAllowedPortInput) < MIN_PORT_NUMBER}
								>
									<Plus size={14} className="text-blue-500" />
								</Button>
							</div>
						</div>
						<div className="flex flex-col justify-center items-start w-full gap-1 bg-[#303030] border border-solid border-input p-4 rounded-[5px]">
							<p className="md:text-lg font-medium">Blocked</p>
							{tunnelInstanceProxyPreview.disallowedPortNumbers.map(
								(disallowedPortNumber) => (
									<div
										key={disallowedPortNumber}
										className="flex flex-row items-center justify-between gap-x-1 w-full"
									>
										<div className="gap-x-2 flex flex-row justify-center items-center">
											<Network size={14} className="text-muted-foreground" />
											{disallowedPortNumber}
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={async () => {
												await removeDisallowedPort({
													portNumber: disallowedPortNumber,
												});
											}}
											className="h-8 w-8 p-0 min-w-[32px]"
										>
											<Minus size={14} className="text-red-500" />
										</Button>
									</div>
								),
							)}

							<div className="flex flex-row justify-between gap-x-2 items-center w-full">
								<Input
									className="w-full"
									type="number"
									value={addDisallowedPortInput}
									inputMode="numeric"
									onChange={(e) => setAddDisallowedPortInput(e.target.value)}
									placeholder="New blocked port"
								/>
								<Button
									onClick={addDisallowedPort}
									disabled={addDisallowedPortInput.trim() === '' ||
										tunnelInstanceProxyPreview.disallowedPortNumbers.includes(
											Number(addDisallowedPortInput),
										) ||
										Number(addDisallowedPortInput) > MAX_PORT_NUMBER ||
										Number(addDisallowedPortInput) < MIN_PORT_NUMBER}
									size="icon"
									variant="ghost"
									className="h-8 w-8 p-0 min-w-[32px]"
								>
									<Plus size={14} className="text-blue-500" />
								</Button>
							</div>
						</div>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
