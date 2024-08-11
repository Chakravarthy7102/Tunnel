import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: [{
		input: './scripts/start.ts',
		builder: 'rollup',
		name: 'start',
	}],
	outDir: '.build',
	rollup: {
		inlineDependencies: true,
		esbuild: {
			minify: true,
		},
	},
});
