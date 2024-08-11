import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });

		await replace({
			files: 'dist/livereload-event-source.js',
			from: [
				outdent`
					const { forceReload = false, added, removed, updated } = msg;
				`,
				/location\.reload\(\)/g,
			],
			to: [
				outdent`
					$&
					if (updated.includes('/chrome-devtools-frontend/overrides.css')) {
						fetch('/__tunnel/chrome-devtools-frontend/overrides.css' + '?t=' + Date.now())
							.then((response) => response.text())
							.then(text => {
								window.__TUNNEL_OVERRIDES_STYLESHEET?.replaceSync(text)
							})
					}
				`,
				'/* $& */',
			],
		});
	},
});
