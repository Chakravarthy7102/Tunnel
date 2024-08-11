import { getAsset } from '@-/assets/utils';
import {
	IntegrationIcon,
	type IntegrationIconProps,
} from '@-/integrations/shared-components';

export function LinearIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={getAsset('/images/linear.svg')}
		/>
	);
}
