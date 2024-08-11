import type { SupportedTarget } from '#types';
import os from 'node:os';
// @ts-expect-error: no types
import { isAppleSilicon } from 'is-apple-silicon';
import { isSupportedTarget } from './supported-targets.ts';

export function getSupportedTargetFromOs<
	const SupportedTargets extends string[],
>({
	supportedTargets,
}: {
	supportedTargets: SupportedTargets;
}): SupportedTarget<SupportedTargets> | null {
	const osTarget = `${os.platform()}-${isAppleSilicon() ? 'arm64' : os.arch()}`;

	return isSupportedTarget(supportedTargets, osTarget) ? osTarget : null;
}
