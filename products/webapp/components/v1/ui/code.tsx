import { Button, cn } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { Check, Clipboard } from 'lucide-react';
import { Highlight, type HighlightProps } from 'prism-react-renderer';
import { useState } from 'react';

const prismTheme = {
	plain: {
		color: '#EDEDEF',
		fontSize: 12,
		fontFamily: 'MonoLisa, Menlo, monospace',
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

export function CodeBlock({
	code,
	language,
	lineNumbers = false,
	isCondensed = false,
}: {
	code: HighlightProps['code'];
	language: HighlightProps['language'];
	lineNumbers?: boolean;
	isCondensed?: boolean;
}) {
	return (
		<div className="relative">
			<div
				className={cn(
					'flex flex-row overflow-auto justify-start items-start rounded-[8px]  border-[#ffffff10] py-2 pl-4 pr-2 w-full font-mono font-light text-sm bg-neutral-900 shadow-stroke-opacity-white text-neutral-0',
					isCondensed && 'max-h-[100px]',
				)}
			>
				<Highlight
					theme={prismTheme}
					code={code}
					language={language}
				>
					{({ style, tokens, getLineProps, getTokenProps }) => (
						<pre style={style}>
					{tokens.map((line, i) => (
						<div key={i} {...getLineProps({ line })}>
							{lineNumbers && (
								<span className="inline-block text-left select-none w-6 flex-shrink-0 text-zinc-700">
									{i + 1}
								</span>
							)}
							{line.map((token, key) => (
								<span key={key} {...getTokenProps({ token })} />
							))}
						</div>
					))}
						</pre>
					)}
				</Highlight>
				<CopyButton text={code} />
			</div>
		</div>
	);
}

function CopyButton({
	text,
}: {
	text: string;
}) {
	const [isClicked, setIsClicked] = useState(false);

	return (
		<Button
			variant="ghost"
			size="icon"
			className="absolute top-1.5 right-1.5 bg-neutral-900"
			onClick={async () => {
				setIsClicked(true);
				await navigator.clipboard.writeText(text);
				toast.COPY_CLIPBOARD_SUCCESS();
				setTimeout(() => {
					setIsClicked(false);
				}, 2000);
			}}
		>
			{isClicked ?
				<Check color="#22c55e" size={14} /> :
				<Clipboard size={14} />}
		</Button>
	);
}
