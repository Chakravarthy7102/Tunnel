import type { WebpackConfigContext } from 'next/dist/server/config-shared';
import type { WebpackOptionsNormalized } from 'webpack';

export type WebpackBootstrapper = (
	config: WebpackOptionsNormalized,
	context: WebpackConfigContext & {
		isClient: boolean;
		phase: string;
	},
) => void;
