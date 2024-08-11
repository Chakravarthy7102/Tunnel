import { defineBuildConfig } from '@-/unbuild';

export default defineBuildConfig({
	entries: [{
		input: 'exports/main.ts',
		builder: 'esbuild',
		format: 'cjs',
		platform: 'node',
	}],
});
