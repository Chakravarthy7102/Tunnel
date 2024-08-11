'use client';

import { getAsanaAuthUrl } from '#utils/auth.ts';
import {
	Button,
	buttonVariants,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	type DialogProps,
	DialogTitle,
} from '@-/design-system/v1';

export function AsanaConnectDialog({
	organizationMemberId,
	container,
	open,
	onOpenChange,
	onSkip,
	...dialogProps
}: DialogProps & {
	organizationMemberId: string;
	container: HTMLElement | null;
	onOpenChange: (open: boolean) => void;
	open: boolean;
	onSkip: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange} {...dialogProps}>
			<DialogContent container={container}>
				<DialogHeader>
					<DialogTitle>Connect to Asana</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<p className="text-muted-foreground">
						This thread has a <a>Asana task</a>{' '}
						connected to it, connect to Asana to resolve this issue
					</p>
				</DialogBody>

				<DialogFooter className="gap-2">
					<Button
						variant="ghost"
						onClick={() => {
							onOpenChange(false);
							onSkip();
						}}
						className="text-muted-foreground"
					>
						Skip
					</Button>
					<a
						href={getAsanaAuthUrl({
							isPersonalConnection: false,
							organizationMemberId,
							redirectPath: null,
						})}
						target="_blank"
						className={buttonVariants({
							variant: 'blue',
						})}
					>
						Connect
					</a>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
