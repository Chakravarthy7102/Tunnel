import { useShadowRootElement } from '#utils/shadow-root.ts';
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
	Switch,
} from '@-/design-system/v1';
import { z } from '@-/zod';
import destr from 'destru';
import capitalize from 'just-capitalize';
import React, { useEffect, useState } from 'react';

type Setting =
	& {
		title: string;
		description: string;
		key: string;
		default: boolean | string;
	}
	& (
		| {
			type: 'select';
			options: { label: string; value: string }[];
		}
		| {
			type: 'checkbox';
		}
	);

export const SETTINGS: Setting[] = [
	{
		title: 'Disable Hide Tunnel Option',
		description: 'Disable the ability to hide the tunnel toolbar',
		key: 'disableHideTunnelOption',
		type: 'checkbox',
		default: false,
	},
	{
		title: 'Theme',
		description: 'Change the interface theme of tunnel',
		key: 'theme',
		type: 'select',
		default: 'dark',
		options: [
			{
				label: 'Light',
				value: 'light',
			},
			{
				label: 'Dark',
				value: 'dark',
			},
		],
	},
];

export function TunnelSettingsButton({ ...props }: ButtonProps) {
	const [settings, setSettings] = useState<
		{
			[key: string]: any;
		} | null
	>(() => {
		const savedSettingsJson = localStorage.getItem('tunnel-settings');
		return savedSettingsJson !== null ?
			z.record(z.string(), z.any()).parse(destr(savedSettingsJson)) :
			null;
	});

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const shadowRootElement = useShadowRootElement();

	useEffect(() => {
		if (settings) {
			localStorage.setItem('tunnel-settings', JSON.stringify(settings));
		}
	}, [settings]);

	const updateSettings = (key: string, value: boolean | string) => {
		setSettings((previousSettings) => ({ ...previousSettings, [key]: value }));
	};

	if (!settings) {
		return;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button {...props} />
			</DialogTrigger>

			<DialogContent container={shadowRootElement}>
				<DialogHeader>
					<DialogTitle>Tunnel settings</DialogTitle>
				</DialogHeader>

				<div className="gap-y-4 flex flex-col justify-start items-start h-full w-full">
					{SETTINGS.map((setting) => (
						<div
							className="flex justify-between items-center w-full"
							key={setting.key}
						>
							<div>
								<h3 className="font-semibold text-white">
									{setting.title}
								</h3>
								<p className="text-sm text-foreground/80">
									{setting.description}
								</p>
							</div>

							{setting.type === 'checkbox' ?
								(
									<Switch
										checked={settings[setting.key]}
										onCheckedChange={(value) =>
											updateSettings(setting.key, value)}
									/>
								) :
								(
									<Select>
										<SelectTrigger className="w-[180px]" disabled>
											<SelectValue placeholder={capitalize(settings.theme)} />
										</SelectTrigger>
										<SelectContent container={shadowRootElement}>
											{setting.options.map((option, i) => (
												<SelectItem
													key={i}
													value={option.value}
													onPointerUp={() =>
														updateSettings(setting.key, option.value)}
												>
													<div className="flex justify-center items-center text-foreground/80">
														{option.label}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
