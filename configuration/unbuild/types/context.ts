import type {
	BuildOptions as EsbuildBuildOptions,
	Format,
	Platform,
} from 'esbuild';
import type {
	BuildConfig as UnbuildBuildConfig,
	BuildContext as UnbuildBuildContext,
	BuildOptions as UnbuildBuildOptions,
} from 'unbuild';

export interface EsbuildBuildEntry {
	builder: 'esbuild';
	input: string;
	format: Format;
	target?: string | string[];
	platform: Platform;
	external?: string[];
	outfile?: string;
}

export type BuildContext = Omit<UnbuildBuildContext, 'options'> & {
	options: BuildOptions;
};

export type BuildOptions = Omit<UnbuildBuildOptions, 'entries'> & {
	entries: Array<
		UnbuildBuildOptions['entries'][number] | EsbuildBuildEntry
	>;
};

export type BuildConfig = Omit<UnbuildBuildConfig, 'entries'> & {
	entries?:
		(UnbuildBuildOptions['entries'][number] | EsbuildBuildEntry | string)[];
	hooks?: UnbuildBuildConfig['hooks'] & {
		'esbuild:options'?: (
			ctx: BuildContext,
			options: EsbuildBuildOptions,
		) => void | Promise<void>;
	};
};
