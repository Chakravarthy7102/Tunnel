import type { TunneledServiceEnvironmentData } from '#types';
import type { HostEnvironmentType } from '@-/host-environment';

export function isTunneledServiceEnvironmentData<
	$HostEnvironmentType extends HostEnvironmentType,
>(
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>,
	narrowArgs: { hostEnvironmentType: $HostEnvironmentType },
	// @ts-expect-error: should work
): tunneledServiceEnvironmentData is TunneledServiceEnvironmentData<
	$HostEnvironmentType
> {
	return (
		tunneledServiceEnvironmentData.hostEnvironment.type ===
			narrowArgs.hostEnvironmentType
	);
}
