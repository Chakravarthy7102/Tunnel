import { getAsset } from '@-/assets/utils';
import {
	IntegrationIcon,
	type IntegrationIconProps,
} from '@-/integrations/shared-components';

export function SlackIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={getAsset('/images/slack.svg')}
		/>
	);
}
