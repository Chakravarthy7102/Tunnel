import type { BuildOptions } from '#types';
import type { AppEnv } from '@-/env/app';
import type { Release } from '@tunnel/release';

export function buildPreset({
	appEnv,
	version,
	release,
	options,
}: {
	appEnv: AppEnv;
	version: string;
	release: Release;
	options?: {
		watch?: boolean;
		skipBuildingDependencies?: boolean;
		injectHmr?: boolean;
	};
}) {
	return {
		replace: {
			'process.env.APP_ENV': JSON.stringify(appEnv),
			'process.env.NEXT_PUBLIC_APP_ENV': JSON.stringify(appEnv),
			'process.env.NODE_ENV': JSON.stringify(appEnv),
			'process.env.TUNNEL_RELEASE': JSON.stringify(release),
			'process.env.NEXT_PUBLIC_TUNNEL_RELEASE': JSON.stringify(release),
			'process.env.VERSION': JSON.stringify(version),
			'process.env.UNBUILD_BUILD_PRESET_OPTIONS': JSON.stringify(options ?? {}),
		},
	};
}

export function getPresetOptionsFromOptions(options: BuildOptions) {
	const {
		'process.env.UNBUILD_BUILD_PRESET_OPTIONS': buildPresetOptions,
	} = options.replace;

	if (buildPresetOptions === undefined) {
		return {};
	}

	// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid
	return JSON.parse(buildPresetOptions) as Record<string, string>;
}

export function getReleaseFromOptions(options: BuildOptions) {
	const {
		'process.env.APP_ENV': appEnv,
		'process.env.TUNNEL_RELEASE': release,
		'process.env.VERSION': version,
	} = options.replace;

	if (appEnv === undefined || release === undefined || version === undefined) {
		throw new Error(
			'Missing third argument `buildPreset` in `build()` options',
		);
	}

	return {
		// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid
		release: JSON.parse(release) as Release,
		// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid
		appEnv: JSON.parse(appEnv) as AppEnv,
		// eslint-disable-next-line no-restricted-properties -- Guaranteed to be valid
		version: JSON.parse(version) as string,
	};
}
