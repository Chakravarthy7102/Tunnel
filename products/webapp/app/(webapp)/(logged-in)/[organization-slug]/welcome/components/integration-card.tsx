import type { ServerDoc } from '@-/database';
import { Button } from '@-/design-system/v1';
import { Check } from 'lucide-react';

import { MuratCard } from './murat-card.tsx';

export function IntegrationCard({
	icon,
	title,
	description,
	isConnected,
	isComingSoon = false,
	href,
}: {
	organization: ServerDoc<'Organization'>;
	icon: React.ReactNode;
	title: string;
	description: string;
	isConnected: boolean;
	isComingSoon?: boolean;
	href: string;
}) {
	return (
		<MuratCard className="p-4 flex flex-col justify-center items-start gap-y-4 md:w-[240px] w-full">
			{icon}
			<div className="flex flex-col justify-center items-start">
				<p className="text-base font-normal text-neutral-0">{title}</p>
				<p className="text-sm font-normal text-neutral-400">
					{description}
				</p>
			</div>
			<Button
				onClick={() => {
					window.open(href, '_blank');
				}}
				variant={isConnected || isComingSoon ?
					'muratsecondary' :
					'muratblue'}
				className={'w-full'}
				disabled={isConnected || isComingSoon}
			>
				{isConnected && <Check size={16} />}
				{isConnected ? 'Connected' : isComingSoon ? 'Coming soon' : 'Connect'}
			</Button>
		</MuratCard>
	);
}
