'use client';

import { cva } from 'class-variance-authority';

export const threadInputContainerVariants = cva(
	'flex flex-col border border-border text-foreground',
	{
		variants: {
			variant: {
				default:
					'justify-center items-center w-full font-light rounded-md bg-popover px-4 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border',
				toolbar:
					'bg-background flex flex-col justify-start items-start px-4 pt-4 w-full h-full',
				toolbarReply:
					'w-full bg-secondary border-t border-border border-solid flex flex-col justify-start items-start px-4 pt-4',
				toolbarEditingComment:
					'w-full bg-secondary border-t border-border border-solid flex flex-col justify-start items-start p-2 rounded-md',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export const threadInputPlateVariants = cva('', {
	variants: {
		variant: {
			default:
				'w-full h-full bg-transparent text-lg border-none py-3 resize-none !outline-none text-foreground',
			toolbar:
				'bg-transparent text-foreground outline-none border-none text-sm w-full resize-none cursor-text',
			toolbarReply:
				'bg-transparent text-foreground outline-none border-none text-sm w-full resize-none cursor-text',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});
