import { cva } from 'class-variance-authority';
import * as React from 'react';

// Define the base styles and variants for the dropdown item
const muratDropdownItemVariants = cva(
	'group relative flex cursor-pointer select-none items-center justify-start outline-none transition-colors border-[0.5px] border-solid border-transparent w-full bg-transparent hover:bg-neutral-600 hover:border-[#ffffff10] [&>svg]:text-neutral-500 text-neutral-0',
	{
		variants: {
			variant: {
				default: '',
				danger: 'hover:!bg-muratred-lighter hover:text-muratred-base ',
			},
			size: {
				small: 'px-2 h-9 text-sm gap-x-2 rounded-[8px]',
				large: 'px-4 py-2.5 text-base',
			},
		},
		defaultVariants: {
			size: 'small',
			variant: 'default',
		},
	},
);

type MuratDropdownMenuItemProps<C extends React.ElementType> = {
	as?: C;
	variant?: 'danger' | 'default';
	size?: 'small' | 'large';
} & React.ComponentPropsWithoutRef<C>;

const MuratDropdownMenuItem = React.forwardRef<
	React.ElementRef<any>,
	MuratDropdownMenuItemProps<React.ElementType>
>(({ as: Component = 'button', className, variant, size, ...props }, ref) => (
	<Component
		ref={ref}
		className={muratDropdownItemVariants({
			variant,
			size,
			class: className,
		})}
		{...props}
	/>
));

export { muratDropdownItemVariants, MuratDropdownMenuItem };
