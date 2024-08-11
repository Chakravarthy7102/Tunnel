import type { SupportedTarget } from '#types';

export function isSupportedTarget<$SupportedTargets extends string[]>(
	supportedTargets: $SupportedTargets,
	target: string,
): target is SupportedTarget<$SupportedTargets> {
	return supportedTargets.includes(target);
}

export function getSupportedTargetFromPackageName<
	const $SupportedTargets extends string[],
>({
	supportedTargets,
	packageName,
}: {
	supportedTargets: $SupportedTargets;
	packageName: string;
}): SupportedTarget<$SupportedTargets> | null {
	for (const supportedTarget of supportedTargets) {
		if (packageName.endsWith(`-${supportedTarget}`)) {
			return supportedTarget;
		}
	}

	return null;
}
