export type { SupportedTarget } from '#types';
export { getSupportedTargetFromOs } from '#utils/get.ts';
export {
	getSupportedTargetFromPackageName,
	isSupportedTarget,
} from '#utils/supported-targets.ts';
export { getTargetFromOption } from '#utils/target-option.ts';
