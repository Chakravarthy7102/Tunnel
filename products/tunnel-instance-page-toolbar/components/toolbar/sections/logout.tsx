import type { PageToolbarContext } from '#types';
import { logout } from '#utils/authentication.ts';
import { Button } from '@-/design-system/v1';
import { LogOut } from 'lucide-react';

export function Logout({ context }: {
	context: PageToolbarContext<{ isOnline: true }>;
}) {
	return (
		<Button
			variant="muratsecondary"
			fill="ghost"
			onClick={async () => logout({ context })}
			className="gap-x-1 text-neutral-0 transition-all flex flex-row justify-start items-center w-full h-full rounded-[8px]"
		>
			<LogOut size={14} />
			<p className="text-sm">Logout</p>
		</Button>
	);
}
