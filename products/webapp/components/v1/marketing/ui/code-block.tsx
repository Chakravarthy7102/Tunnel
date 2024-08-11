import { Paragraph4 } from '#components/v1/marketing/typography.tsx';
import { Check, Copy, File, Github } from 'lucide-react';
import {
	Highlight,
	type HighlightProps,
	type PrismTheme,
} from 'prism-react-renderer';
import { useState } from 'react';
import { Button, type ButtonProps } from './button.tsx';
import { Link } from './link.tsx';

export interface CodeBlockProps
	extends Omit<HighlightProps, 'theme' | 'children'>
{
	fileName: string;
	githubLink?: string;
}

export function CodeBlock(
	{ fileName, githubLink, ...highlightProps }: CodeBlockProps,
) {
	return (
		<div className="flex flex-col w-full border border-border rounded-2xl bg-secondary/20 min-h-[420px] overflow-auto">
			<div className="w-full flex flex-row justify-between items-center border-b border-input bg-background/70">
				<div className="flex flex-row gap-2 items-center border-r border-input px-4 py-3">
					<File size={16} className="stroke-current text-muted-foreground" />
					<Paragraph4 className="text-muted-foreground">
						{fileName}
					</Paragraph4>
				</div>
				<div className="flex flex-row pr-2">
					<CopyButton
						copyText={highlightProps.code}
					/>
					{githubLink && (
						<Button
							variant="ghost"
							size="icon"
							rel="noopener noreferrer"
							asChild
						>
							<Link href={githubLink} target="_blank">
								<Github
									size={16}
									className="stroke-current text-white"
								/>
							</Link>
						</Button>
					)}
				</div>
			</div>
			<div className="p-4 text-sm">
				<Highlight
					theme={prismTheme}
					{...highlightProps}
				>
					{({ style, tokens, getLineProps, getTokenProps }) => (
						<pre style={style}>
									{tokens.map((line, i) => (
										<div key={i} {...getLineProps({ line })}>
											<span className="inline-block text-left select-none w-8 flex-shrink-0 text-input">
												{i + 1}
											</span>
											{line.map((token, key) => (
												<span key={key} {...getTokenProps({ token })} />
											))}
										</div>
									))}
						</pre>
					)}
				</Highlight>
			</div>
		</div>
	);
}

const prismTheme: PrismTheme = {
	plain: {
		color: '#EDEDEF',
	},
	styles: [
		{
			types: ['comment'],
			style: {
				color: '#706F78',
			},
		},
		{
			types: ['atrule', 'keyword', 'attr-name', 'selector'],
			style: {
				color: '#7E7D86',
			},
		},
		{
			types: ['punctuation', 'operator'],
			style: {
				color: '#706F78',
			},
		},
		{
			types: ['class-name', 'function', 'tag', 'key-white'],
			style: {
				color: '#EDEDEF',
			},
		},
	],
};

interface CopyButtonProps extends ButtonProps {
	copyText: string;
}

const CopyButton = ({ copyText, onClick, ...props }: CopyButtonProps) => {
	const [isCopied, setIsCopied] = useState<boolean>(false);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={async (event) => {
				setIsCopied(true);
				await navigator.clipboard.writeText(copyText);
				if (onClick !== undefined) onClick(event);
				setTimeout(() => {
					setIsCopied(false);
				}, 2000);
			}}
			{...props}
		>
			{isCopied ?
				<Check size={16} className="stroke-green-500" /> :
				<Copy size={16} />}
		</Button>
	);
};
