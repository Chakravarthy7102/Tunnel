import { cn } from '@-/design-system/v1';
import { cva, type VariantProps } from 'class-variance-authority';

const integrationIconVariants = cva('overflow-hidden min-w-max', {
	variants: {
		variant: {
			default: 'rounded-[5px]',
			rounded: 'rounded-full',
		},
		size: {
			default: 'h-10 w-10',
			sm: 'h-6 w-6',
			xs: 'h-4 w-4',
			lg: 'h-12 w-12',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
	},
});

export interface IntegrationIconProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof integrationIconVariants>
{
	src: string;
}

export function IntegrationIcon({
	src,
	className,
	variant,
	size,
	...props
}: IntegrationIconProps) {
	return (
		<div
			className={cn(integrationIconVariants({ variant, size, className }))}
			{...props}
		>
			<img src={src} className="h-full w-full" draggable={false} />
		</div>
	);
}
