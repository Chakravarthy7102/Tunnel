import {
	RichText as BasehubRichText,
} from 'basehub/react-rich-text.js';
import Image from 'next/image';
import type { ComponentPropsWithoutRef } from 'react';
import {
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
} from './typography.tsx';

interface RichTextProps
	extends ComponentPropsWithoutRef<typeof BasehubRichText>
{}

export function RichText({ children, ...props }: RichTextProps) {
	return (
		<div className="flex flex-col gap-2">
			<BasehubRichText
				// @ts-expect-error
				components={{
					h1: ({ children }) => (
						<Heading1 className="text-white mt-5 first:mt-0">
							{children}
						</Heading1>
					),
					h2: ({ children }) => (
						<Heading2 className="text-white mt-4 first:mt-0">
							{children}
						</Heading2>
					),
					h3: ({ children }) => (
						<Heading3 className="text-white mt-3 first:mt-0">
							{children}
						</Heading3>
					),
					h4: ({ children }) => (
						<Heading4 className="text-white mt-2 first:mt-0">
							{children}
						</Heading4>
					),
					h5: ({ children }) => (
						<Heading5 className="text-white mt-1 first:mt-0">
							{children}
						</Heading5>
					),
					h6: ({ children }) => (
						<Heading6 className="text-white">
							{children}
						</Heading6>
					),
					ul: ({ children }) => (
						<ul className="list-disc list-outside pl-[18px]">{children}</ul>
					),
					ol: ({ children }) => <ol>{children}</ol>,
					li: ({ children }) => <li className="list-item pb-1">{children}</li>,
					a: ({ children, href }) => (
						<a href={href} className="text-blue-500 underline">
							{children}
						</a>
					),
					s: ({ children }) => <strong className="font-bold">{children}
					</strong>,
					em: ({ children }) => <em className="italic">{children}</em>,
					code: ({ children }) => (
						<code className="font-mono text-sm bg-secondary p-1 rounded-sm">
							{children}
						</code>
					),
					img: ({ src, alt }) => (
						<div className="w-full aspect-video relative rounded-2xl my-2 border border-border overflow-hidden">
							<Image
								src={src}
								alt={alt ?? 'Caption not provided'}
								fill
								className="object-cover"
							/>
						</div>
					),
				}}
				{...props}
			>
				{children}
			</BasehubRichText>
		</div>
	);
}
