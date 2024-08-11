import { getAsset } from '@-/assets/utils';
import {
	IntegrationIcon,
	type IntegrationIconProps,
} from './integration-icon.tsx';

export function TeamsIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={getAsset('/images/teams.svg')}
		/>
	);
}
