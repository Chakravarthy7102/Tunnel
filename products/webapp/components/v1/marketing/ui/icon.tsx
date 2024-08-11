import { icons, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

export interface IconProps extends ComponentProps<LucideIcon> {
	name: keyof typeof icons;
}

export function Icon({
	name,
	...iconProps
}: IconProps) {
	const IconComponent = icons[name];
	return <IconComponent {...iconProps} />;
}
