import type { PageToolbarContext } from '#types';
import { getAuthenticateUrl } from '#utils/authentication.ts';
import { useContextStore } from '#utils/context/_.ts';
import { Button } from '@-/design-system/v1';
import { useFloating } from '@floating-ui/react';
import { LogIn } from 'lucide-react';

export function OfflineLogin(_args: {
	context: PageToolbarContext<{
		actorType: null;
		online: false;
	}>;
}) {
	const { refs, floatingStyles } = useFloating();

	return (
		<>
			<Button
				variant="muratsecondary"
				fill="ghost"
				ref={refs.setReference}
				disabled
				className="gap-x-1 text-neutral-0 transition-all flex flex-row justify-start items-center w-full h-full rounded-[8px]"
			>
				<LogIn size={14} />
				<p className="text-sm ">Sign in</p>
			</Button>
			<div ref={refs.setFloating} style={floatingStyles}></div>
		</>
	);
}

export function Login({ context }: {
	context: PageToolbarContext<{
		actorType: null;
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);
	const authenticateUrl = getAuthenticateUrl({
		hostnameType: state.hostnameType,
		hostEnvironmentType: state.hostEnvironmentType,
	});
	return (
		<Button
			asChild
			variant="muratsecondary"
			fill="ghost"
			className="gap-x-1 text-neutral-0 transition-all flex flex-row justify-start items-center w-full h-full rounded-[8px]"
		>
			<a className="text-sm" href={authenticateUrl}>
				<LogIn size={14} />
				Sign in
			</a>
		</Button>
	);
}
