import {
	IntegrationIcon,
	type IntegrationIconProps,
} from './integration-icon.tsx';

export function TunnelIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={'https://tunnel.dev/assets/images/logo.png'}
		/>
	);
}
