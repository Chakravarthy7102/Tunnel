import { ChevronRight, Play } from 'lucide-react';
import Image from 'next/image';

import {
	Display1,
	Paragraph1,
	Paragraph3,
} from '#components/v1/marketing/typography.tsx';
import { Button } from '#components/v1/marketing/ui/button.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { Link } from '#components/v1/marketing/ui/link.tsx';
import type { ComponentProps } from 'react';

interface HeroProps {
	eyebrow: {
		href: string;
		external: boolean;
		text: string;
	};
	title: string;
	subtitle: string;
	callsToAction: {
		text: string;
		href: string;
		external: boolean;
		variant: ComponentProps<typeof Button>['variant'];
	}[];
	thumbnail: {
		src: string;
		alt: string;
	};
	videoUrl: string;
}

export const Hero = (
	{
		eyebrow,
		title,
		subtitle,
		callsToAction,
		thumbnail,
		videoUrl,
	}: HeroProps,
) => {
	return (
		<BlockContainer className="sm:gap-16 gap-8">
			<div className="flex flex-col items-center justify-center text-center sm:gap-8 gap-4">
				<Link
					className="flex flex-row justify-center items-center pl-4 pr-2 py-1 border border-input bg-secondary rounded-full gap-1.5 hover:bg-secondary/80 transition-colors"
					href={eyebrow.href}
					external={eyebrow.external}
				>
					<Paragraph3>{eyebrow.text}</Paragraph3>
					<ChevronRight className="w-3 h-3 text-muted-foreground" />
				</Link>
				<Display1>{title}</Display1>
				<Paragraph1 className="max-w-xl text-muted-foreground">
					{subtitle}
				</Paragraph1>
				<div className="flex flex-row sm:gap-4 gap-2">
					{callsToAction.map((cta, index) => (
						<Button key={index} variant={cta.variant} size={'lg'} asChild>
							<Link href={cta.href} external={cta.external}>
								{cta.text}
							</Link>
						</Button>
					))}
				</div>
			</div>
			<div className="w-full aspect-[16/9] sm:p-3 p-2 border border-border rounded-2xl bg-secondary overflow-hidden relative">
				<Image
					src={thumbnail.src}
					alt={thumbnail.alt}
					fill
					style={{ objectFit: 'cover' }}
				/>
				{videoUrl !== 'undefined' && (
					<div className="w-full h-full absolute flex flex-col gap-4 items-center justify-center">
						<a
							href={videoUrl}
							target="_blank"
							className="h-24 w-24 rounded-full bg-accent hover:bg-accent/90 flex justify-center items-center"
						>
							<Play
								size={48}
								className="fill-white stroke-white ml-1"
							/>
						</a>
					</div>
				)}
			</div>
		</BlockContainer>
	);
};
