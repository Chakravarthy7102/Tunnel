import os from 'node:os';

export function getTargetFromOption(targetOption: undefined | false | string): {
	platform: string;
	arch: string;
} | null {
	let target: { platform: string; arch: string } | null;
	// if `options.target` is false, don't use a target for the build
	if (targetOption === false) {
		target = null;
	} else if (targetOption === undefined) {
		target = {
			platform: os.platform(),
			arch: os.arch(),
		};
	} else {
		const [platform, arch] = targetOption.split('-');

		if (platform === undefined || arch === undefined) {
			throw new Error(`Invalid target: ${targetOption}`);
		}

		target = { platform, arch };
	}

	return target;
}
