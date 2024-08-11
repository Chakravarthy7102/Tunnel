import { useShadowRootElement } from '#utils/shadow-root.ts';
import {
	Button,
	type ButtonProps,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@-/design-system/v1';
import { useState } from 'react';

export function PortSettingsButton({ ...props }: ButtonProps) {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const shadowRootElement = useShadowRootElement();

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button {...props} />
			</DialogTrigger>

			<DialogContent container={shadowRootElement}>
				<DialogHeader>
					<DialogTitle>Tunnel settings</DialogTitle>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
