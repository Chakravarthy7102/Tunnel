'use client';

import type { NonNullPreloaded } from '#types';
import type { api, ServerDoc } from '@-/database';
import type {
	OrganizationMember_$actorProfileData,
} from '@-/database/selections';
import type { PropsWithChildren, ReactNode } from 'react';
import { DrawerMenu } from './drawer.tsx';

export function HeaderContainer({
	children,
}: PropsWithChildren<{
	breadcrumbs?: {
		href: string;
		label: string;
	}[];
}>) {
	return (
		<div className="p-6 border-b border-solid border-border flex flex-col justify-center items-center w-full">
			<div className="flex flex-row justify-between items-center w-full">
				{children}
			</div>
		</div>
	);
}

export function FilterContainer({ children }: { children: ReactNode }) {
	return (
		<div className="px-6 py-3 border-b border-solid border-border flex flex-col justify-center items-center w-full">
			<div className="flex flex-row justify-between items-center w-full">
				{children}
			</div>
		</div>
	);
}

export function HeaderTitle({
	children,
	icon,
	actorOrganizationMember,
}: PropsWithChildren<{
	icon?: ReactNode;
	breadcrumbs?: ReactNode;
	actorOrganizationMember:
		| NonNullPreloaded<typeof api.v.OrganizationMember_get_actorProfileData>
		| ServerDoc<typeof OrganizationMember_$actorProfileData>;
}>) {
	return (
		<div className="flex flex-row justify-center items-center gap-x-3 ">
			{icon && <div className="hidden md:flex">{icon}</div>}
			<DrawerMenu
				actorOrganizationMember={actorOrganizationMember}
			>
				{children}
			</DrawerMenu>
			<div className="md:text-2xl text-xl text-foreground flex flex-row justify-center items-center gap-x-2 font-medium line-clamp-1">
				{children}
			</div>
		</div>
	);
}
