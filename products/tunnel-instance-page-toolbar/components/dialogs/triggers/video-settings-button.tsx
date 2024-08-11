/* eslint-disable @typescript-eslint/no-non-null-assertion -- todo */

import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import {
	Button,
	type ButtonProps,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useDevices } from '@daily-co/daily-react';
import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function VideoSettingsButton({
	context,
	...props
}: ButtonProps & {
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProjectLivePreview: true;
	}>;
}) {
	const { webappTrpc } = getWebappTrpc({ context });
	const {
		microphones,
		speakers,
		cameras,
		setMicrophone,
		setCamera,
		setSpeaker,
		refreshDevices,
	} = useDevices();
	const state = useContextStore(context);

	useEffect(() => {
		void refreshDevices();
	}, [state.hasUserJoinedDailyRoom]);

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const shadowRootElement = useShadowRootElement();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button {...props} />
			</DialogTrigger>

			<DialogContent container={shadowRootElement} className="bg-background">
				<DialogHeader>
					<DialogTitle>Video settings</DialogTitle>
				</DialogHeader>

				<div className="gap-y-4 flex flex-col justify-start items-start h-full w-full">
					{/* Microphone Select */}
					<div className="flex flex-col justify-center items-start text-white w-full gap-y-1">
						<p className="text-sm text-[#999]">Microphone</p>

						<Select disabled={microphones.length === 0}>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={microphones.length > 0 ?
										microphones.find(
											(mic) =>
												mic.device.deviceId ===
													state.videoBubble.microphoneDeviceId,
										)?.device.label ?? 'Default' :
										'No microphones found'}
								/>
							</SelectTrigger>
							<SelectContent className="w-full" container={shadowRootElement}>
								{microphones.map((mic) => (
									<SelectItem
										className="cursor-pointer"
										onClick={async () => {
											await setMicrophone(mic.device.deviceId);

											const microphone = microphones.find(
												(microphone) =>
													microphone.device.deviceId === mic.device.deviceId,
											);
											state.videoBubble.microphoneDeviceId =
												mic.device.deviceId;
											const result = await webappTrpc.user.update.mutate({
												actor: {
													type: 'User',
													data: { id: state.actor.data.id },
												},
												user: {
													id: state.actor.data.id,
												},
												updates: {
													callSettings: {
														microphoneDeviceId: microphone?.device.deviceId,
														microphoneDeviceName: microphone?.device.label,
													},
												},
											});
											if (result.isErr()) {
												toast.procedureError(result);
											}
										}}
										key={`mic-${mic.device.deviceId}`}
										value={mic.device.label}
									>
										<div className="flex flex-row justify-between items-center w-full">
											<p>{mic.device.label}</p>
											{state.videoBubble.microphoneDeviceId ===
													mic.device.deviceId && <Check color="#4299e1" />}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Speakers Select */}
					<div className="flex flex-col justify-center items-start text-white w-full gap-y-1">
						<p className="text-sm text-[#999]">Speakers</p>

						<Select disabled={speakers.length === 0}>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={speakers.length > 0 ?
										speakers.find(
											(speaker) =>
												speaker.device.deviceId ===
													state.videoBubble.speakerDeviceId,
										)?.device.label ?? 'Default' :
										'No speakers found'}
								/>
							</SelectTrigger>
							<SelectContent className="w-full" container={shadowRootElement}>
								{speakers.map((s) => (
									<SelectItem
										className="cursor-pointer"
										onClick={async () => {
											await setSpeaker(s.device.deviceId);

											const speaker = speakers.find(
												(speaker) =>
													speaker.device.deviceId === s.device.deviceId,
											);
											state.videoBubble.speakerDeviceId = s.device.deviceId;
											const result = await webappTrpc.user.update.mutate({
												actor: {
													type: 'User',
													data: { id: state.actor.data.id },
												},
												user: {
													id: state.actor.data.id,
												},
												updates: {
													callSettings: {
														speakerDeviceId: speaker?.device.deviceId,
														speakerDeviceName: speaker?.device.label,
													},
												},
											});
											if (result.isErr()) {
												toast.procedureError(result);
											}
										}}
										key={`speaker-${s.device.deviceId}`}
										value={s.device.label}
									>
										<div className="flex flex-row justify-between items-center w-full">
											<p>{s.device.label}</p>
											{state.videoBubble.speakerDeviceId ===
													s.device.deviceId && <Check color="#4299e1" />}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Camera Select */}
					<div className="flex flex-col justify-center items-start text-white w-full gap-y-1">
						<p className="text-sm text-[#999]">Camera</p>

						<Select disabled={cameras.length === 0}>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={cameras.length > 0 ?
										cameras.find(
											(camera) =>
												camera.device.deviceId ===
													state.videoBubble.videoDeviceId,
										)?.device.label ?? 'Default' :
										'No cameras found'}
								/>
							</SelectTrigger>
							<SelectContent className="w-full" container={shadowRootElement}>
								{cameras.map((c) => (
									<SelectItem
										className="cursor-pointer"
										onClick={async () => {
											await setCamera(c.device.deviceId);

											const camera = cameras.find(
												(camera) =>
													camera.device.deviceId === c.device.deviceId,
											);
											state.videoBubble.videoDeviceId = c.device.deviceId;
											const result = await webappTrpc.user.update.mutate({
												actor: {
													type: 'User',
													data: { id: state.actor.data.id },
												},
												user: {
													id: state.actor.data.id,
												},
												updates: {
													callSettings: {
														videoDeviceId: camera?.device.deviceId,
														videoDeviceName: camera?.device.label,
													},
												},
											});
											if (result.isErr()) {
												toast.procedureError(result);
											}
										}}
										key={`camera-${c.device.deviceId}`}
										value={c.device.label}
									>
										<div className="flex flex-row justify-between items-center w-full">
											<p>{c.device.label}</p>
											{state.videoBubble.videoDeviceId ===
													c.device.deviceId && <Check color="#4299e1" />}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
