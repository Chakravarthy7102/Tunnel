import type { HostEnvironmentType } from '#enums/host-environment-type.ts';
import type { HostEnvironment } from '#types';

export function isHostEnvironment<
	$HostEnvironmentType extends HostEnvironmentType,
>(
	hostEnvironment: HostEnvironment,
	narrowArgs: { type: $HostEnvironmentType },
): hostEnvironment is HostEnvironment<$HostEnvironmentType> {
	return hostEnvironment.type === narrowArgs.type;
}
