'use client';

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@-/design-system/v1';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { Button, type ButtonProps } from './ui/button.tsx';
import { type LinkProps } from './ui/link.tsx';

interface HeaderProps {
	logo: {
		src: string;
		alt: string;
	};
	navigationItems: (Omit<LinkProps, 'children'> & {
		text: string;
	})[];
	callsToAction: (Omit<LinkProps, 'children'> & {
		text: string;
		variant: ButtonProps['variant'];
	})[];
}

export const Header = (
	props: HeaderProps,
) => {
	const isMobile = useMediaQuery('(max-width: 640px)', {
		defaultValue: false,
		initializeWithValue: false,
	});

	return isMobile ? <MobileMenu {...props} /> : <WebMenu {...props} />;
};

const WebMenu = ({ logo, navigationItems, callsToAction }: HeaderProps) => {
	return (
		<header className="sticky top-0 z-20 w-full flex flex-col justify-center items-center mx-auto sm:bg-background/50 sm:backdrop-filter sm:backdrop-blur-md max-w-5xl ">
			<div className="w-full flex flex-row items-center justify-between py-4 border-b border-solid border-b-border container">
				<Link href="/">
					<Image
						src={logo.src}
						alt={logo.alt}
						width={112}
						height={28}
					/>
				</Link>
				<div className="flex-row justify-center items-center gap-x-1 sm:flex hidden">
					{navigationItems.map((navigationItem, index) => (
						<Button
							key={index}
							variant="ghost"
							size="sm"
							asChild
							className="hover:bg-secondary/50"
						>
							<Link href={navigationItem.href}>{navigationItem.text}</Link>
						</Button>
					))}
				</div>

				<div className="flex flex-row items-center gap-2">
					{callsToAction.map((callToAction, index) => (
						<Button
							key={index}
							variant={callToAction.variant}
							size="sm"
							asChild
						>
							<Link href={callToAction.href}>{callToAction.text}</Link>
						</Button>
					))}
				</div>
			</div>
		</header>
	);
};

const MobileMenu = ({ logo, navigationItems }: HeaderProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
			<header className="sticky h-12 top-0 z-20 w-full flex flex-row justify-between items-center mx-auto bg-background max-w-5xl py-4 border-b border-solid border-b-border container">
				<Link href="/">
					<Image
						src={logo.src}
						alt={logo.alt}
						width={80}
						height={20}
						onClick={() => setIsOpen(false)}
					/>
				</Link>
				<CollapsibleTrigger>
					<Button
						size="icon"
						variant="ghost"
					>
						{isOpen ? <X size={16} /> : <Menu size={16} />}
					</Button>
				</CollapsibleTrigger>
				<CollapsibleContent asChild>
					<div className="absolute top-12 left-0 w-full h-screen bg-background py-4 container">
						<div className="flex flex-col gap-2 items-start">
							{navigationItems.map((navigationItem, index) => (
								<Link
									key={index}
									href={navigationItem.href}
									className="text-xl"
									onClick={() => setIsOpen(false)}
								>
									{navigationItem.text}
								</Link>
							))}
						</div>
					</div>
				</CollapsibleContent>
			</header>
		</Collapsible>
	);
};
