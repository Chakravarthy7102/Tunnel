'use client';

import {
	Display2,
	Paragraph2,
} from '#components/v1/marketing/typography.tsx';
import { Button } from '#components/v1/marketing/ui/button.tsx';
import {
	CodeBlock,
	type CodeBlockProps,
} from '#components/v1/marketing/ui/code-block.tsx';
import { BlockContainer } from '#components/v1/marketing/ui/layout.tsx';
import { useState } from 'react';

interface CodeProps {
	title: string;
	subtitle: string;
	tabs: {
		title: string;
		code: CodeBlockProps;
	}[];
}

export const Code = ({ title, subtitle, tabs }: CodeProps) => {
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

	return (
		<BlockContainer className="gap-10">
			<div className="flex flex-col items-center justify-center text-center gap-4">
				<Display2>{title}</Display2>
				<Paragraph2 className="text-muted-foreground">
					{subtitle}
				</Paragraph2>
			</div>
			<div className="flex flex-col w-full justify-center items-center gap-4">
				<div className="flex flex-row items-center justify-start gap-3">
					{tabs.map((tab, index) => {
						return (
							<Button
								key={index}
								variant={selectedTabIndex === index ? 'secondary' : 'ghost'}
								className="gap-2"
								onClick={() => {
									setSelectedTabIndex(index);
								}}
							>
								{tab.title}
							</Button>
						);
					})}
				</div>
				{tabs[selectedTabIndex] !== undefined && (
					<CodeBlock
						{
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to be defined
							...tabs[selectedTabIndex]!.code
						}
					/>
				)}
			</div>
		</BlockContainer>
	);
};
