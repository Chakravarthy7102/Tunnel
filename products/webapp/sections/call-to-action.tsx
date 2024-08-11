'use client';

import {
	Display2,
	Paragraph2,
} from '#components/v1/marketing/typography.tsx';
import { Button } from '#components/v1/marketing/ui/button.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { Link } from '#components/v1/marketing/ui/link.tsx';
import type { ComponentProps } from 'react';

interface CallToActionProps {
	title: string;
	subtitle: string;
	callsToAction: {
		text: string;
		href: string;
		external: boolean;
		variant: ComponentProps<typeof Button>['variant'];
	}[];
}

export const CallToAction = (
	{ title, subtitle, callsToAction }: CallToActionProps,
) => {
	return (
		<BlockContainer className="sm:gap-16 gap-8">
			<div className="flex flex-col items-center justify-center text-center gap-6 sm:gap-12 w-full
      ">
				<div className="flex flex-col items-center justify-center text-center gap-3 sm:gap-6">
					<Display2>{title}</Display2>
					{subtitle && (
						<Paragraph2 className="max-w-xl text-muted-foreground">
							{subtitle}
						</Paragraph2>
					)}
				</div>
				<div className="flex flex-row sm:gap-4 gap-2">
					{callsToAction.map((cta, index) => (
						<Button
							key={index}
							variant={cta.variant}
							size={'lg'}
							asChild
						>
							<Link
								href={cta.href}
								external={cta.external}
								target={cta.external ? '_blank' : '_self'}
							>
								{cta.text}
							</Link>
						</Button>
					))}
				</div>
			</div>
		</BlockContainer>
	);
};
