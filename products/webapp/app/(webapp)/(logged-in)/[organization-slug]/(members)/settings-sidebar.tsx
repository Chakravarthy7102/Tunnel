'use client';

import {
	Sidebar,
	SidebarGroup,
	SidebarItem,
	SidebarItemGroup,
	SidebarLabel,
} from '#components/dashboard/ui/sidebar.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import {
	ChevronLeft,
	CreditCard,
	Settings,
	UserCircle2,
	Users,
	Webhook,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SettingsSidebar() {
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const pathname = usePathname();

	return (
		<Sidebar>
			<div className="p-3">
				<Link
					href={`/${organization.slug}`}
					className="flex flex-row items-center gap-2 py-2 [&>svg]:text-v2-neutral-400 [&>svg]:hover:text-white transition-colors"
				>
					<ChevronLeft size={16} />
					Settings
				</Link>
			</div>
			<SidebarGroup className="mt-0">
				<SidebarLabel>Organization</SidebarLabel>
				<SidebarItemGroup>
					<SidebarItem
						href={`/${organization.slug}/settings`}
						active={pathname === `/${organization.slug}/settings`}
					>
						<Settings size={16} />
						General
					</SidebarItem>
					<SidebarItem
						href={`/${organization.slug}/settings/people`}
						active={pathname === `/${organization.slug}/settings/people`}
					>
						<Users size={16} />
						Members
					</SidebarItem>
					<SidebarItem
						href={`/${organization.slug}/settings/billing`}
						active={pathname === `/${organization.slug}/settings/billing`}
					>
						<CreditCard size={16} />
						Billing
					</SidebarItem>
					<SidebarItem
						href={`/${organization.slug}/settings/integrations`}
						active={pathname === `/${organization.slug}/settings/integrations`}
					>
						<Webhook size={16} />
						Integrations
					</SidebarItem>
				</SidebarItemGroup>
			</SidebarGroup>
			<SidebarGroup>
				<SidebarLabel>Account</SidebarLabel>
				<SidebarItemGroup>
					<SidebarItem
						href={`/${organization.slug}/settings/profile`}
						active={pathname === `/${organization.slug}/settings/profile`}
					>
						<UserCircle2 size={16} />
						Profile
					</SidebarItem>
				</SidebarItemGroup>
			</SidebarGroup>
		</Sidebar>
	);
}
