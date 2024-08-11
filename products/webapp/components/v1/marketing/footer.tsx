import Image from 'next/image';
import { Paragraph3 } from './typography.tsx';
import { Button } from './ui/button.tsx';
import { Link } from './ui/link.tsx';

interface FooterProps {
	logo: {
		src: string;
		alt: string;
	};
	columns: {
		title: string;
		links: {
			text: string;
			href: string;
			external: boolean;
		}[];
	}[];
}

export const Footer = ({ logo, columns }: FooterProps) => {
	return (
		<footer className="flex sm:flex-row flex-col sm:justify-between justify-start py-12 sm:py-24 max-h-[384px] container max-w-5xl mx-auto sm:border-none border-t border-solid border-border sm:gap-0 gap-6">
			<div className="flex flex-col items-start">
				<Image
					src={logo.src}
					alt={logo.alt}
					height={32}
					width={128}
				/>
			</div>
			<div className="grid sm:grid-cols-2 sm:gap-16 grid-cols-1 gap-8 grid-flow-col-dense w-max">
				{columns.map((column) => (
					<div className="flex flex-col gap-2">
						<Paragraph3>
							{column.title}
						</Paragraph3>
						{column.links.map((link, index) => (
							<Button
								key={index}
								variant="link"
								size="default"
								className="p-0 justify-start h-auto text-muted-foreground"
								asChild
							>
								<Link href={link.href} external={link.external}>
									{link.text}
								</Link>
							</Button>
						))}
					</div>
				))}
			</div>
		</footer>
	);
};
