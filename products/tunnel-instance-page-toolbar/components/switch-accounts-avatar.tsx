import type { PageToolbarContext } from '#types';
import { logout } from '#utils/authentication.ts';
import { useContextStore } from '#utils/context/use.ts';
import { useShadowRootElement } from '#utils/shadow-root.ts';
import { select } from '@-/client-doc';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import { UserAvatar } from '@-/user/components';
import { LogOut } from 'lucide-react';

export function SwitchAccountsAvatar({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);
	const actorUser = select(
		state,
		'User',
		state.actor.data.id,
	);
	const shadowRoot = useShadowRootElement();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="w-full">
				<Button variant="ghost" size="sm">
					<UserAvatar
						size="sm"
						profileImageUrl={actorUser.profileImageUrl}
						name={actorUser.fullName}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" container={shadowRoot}>
				<div className="p-2 text-sm">
					<span className="text-light-200">Logged in as{' '}</span>
					{actorUser.email}
				</div>
				<DropdownMenuItem
					onClick={async () => {
						logout({ context });
					}}
					danger
				>
					<LogOut size={14} />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
