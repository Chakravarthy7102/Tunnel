import {
	Display2,
	Heading4,
	Heading6,
	Paragraph2,
	Paragraph3,
} from '#components/v1/marketing/typography.tsx';
import { Icon } from '#components/v1/marketing/ui/icon.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { cn } from '@-/design-system/v1';
import type { icons } from 'lucide-react';
import Image from 'next/image';

interface CardGridProps {
	title: string;
	subtitle: string;
	cards: CardProps[];
	grid?: GridItemProps[];
}

export const CardGrid = (
	{ title, subtitle, cards, grid = [] }: CardGridProps,
) => {
	return (
		<BlockContainer>
			<div className="flex flex-col items-center justify-center text-center sm:gap-10 gap-5 w-full">
				<div className="flex flex-col items-center justify-center text-center sm:gap-6 gap-2">
					<Display2>{title}</Display2>
					<Paragraph2 className="text-muted-foreground">
						{subtitle}
					</Paragraph2>
				</div>
				<div className="flex sm:flex-row flex-col flex-wrap gap-3 w-full">
					{cards.map((card, index) => <Card key={index} {...card} />)}
				</div>
				<div className="flex sm:flex-row flex-col flex-wrap justify-between w-full">
					{grid.map((gridItem, index) => (
						<GridItem
							key={index}
							{...gridItem}
						/>
					))}
				</div>
			</div>
		</BlockContainer>
	);
};

interface CardProps {
	size: {
		width: '100%' | '60%' | '50%' | '40%';
		height: 'sm' | 'md' | 'lg';
	};
	icon: keyof typeof icons;
	title: string;
	description: string;
	image: {
		src: string;
		alt: string;
	};
}

const Card = ({
	size,
	icon,
	title,
	description,
	image,
}: CardProps) => {
	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center sm:p-3 p-2 bg-secondary/20 border border-border rounded-2xl w-full',
				size.width === '100%' && 'sm:w-[calc(100%-6px)]',
				size.width === '60%' && 'sm:w-[calc(60%-6px)]',
				size.width === '50%' && 'sm:w-[calc(50%-6px)]',
				size.width === '40%' && 'sm:w-[calc(40%-6px)]',
				size.height === 'lg' && 'sm:h-[640px] h-[512px]',
				size.height === 'md' && 'sm:h-[512px] h-[448px]',
				size.height === 'sm' && 'sm:h-[384px] h-[320px]',
			)}
		>
			<div className="flex flex-col items-center gap-2 px-6 py-8 max-w-sm">
				<Icon name={icon} className="w-6 h-6 min-w-max" />
				<Heading4>{title}</Heading4>
				<Paragraph3 className="text-center text-muted-foreground">
					{description}
				</Paragraph3>
			</div>
			<div className="w-full h-full relative rounded-xl border border-secondary overflow-auto bg-secondary/40">
				<Image
					src={image.src}
					alt={image.alt}
					fill={true}
					style={{ objectFit: 'cover', objectPosition: 'center top' }}
				/>
			</div>
		</div>
	);
};

interface GridItemProps {
	icon: keyof typeof icons;
	title: string;
	description: string;
}

const GridItem = ({ icon, title, description }: GridItemProps) => {
	return (
		<div className="hidden flex-col sm:gap-2 gap-1 w-full sm:w-1/3 p-4 sm:flex">
			<div className="flex flex-row items-center gap-2">
				<Icon name={icon} className="w-4 h-4" />
				<Heading6>{title}</Heading6>
			</div>
			<Paragraph3 className="text-left text-muted-foreground">
				{description}
			</Paragraph3>
		</div>
	);
};
