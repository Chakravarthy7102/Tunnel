import { getAsset } from '@-/assets/utils';

import {
	IntegrationIcon,
	type IntegrationIconProps,
} from '@-/integrations/components';

export function GithubIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={getAsset('/images/github.svg')}
		/>
	);
}
