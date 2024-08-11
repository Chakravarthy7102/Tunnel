import { getAsset } from '@-/assets/utils';
import {
	IntegrationIcon,
	type IntegrationIconProps,
} from '@-/integrations/shared-components';

export function JiraIcon({ ...props }: Omit<IntegrationIconProps, 'src'>) {
	return (
		<IntegrationIcon
			{...props}
			src={getAsset('/images/jira.svg')}
		/>
	);
}
