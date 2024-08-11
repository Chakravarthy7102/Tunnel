import { createPatchFileReplacer, definePatch } from '#utils/patch.ts';
import { outdent } from 'outdent';

export default definePatch({
	async patch({ temporaryPatchDirectory }) {
		const replace = createPatchFileReplacer({ temporaryPatchDirectory });
		await replace({
			files: 'dist/index.mjs',
			from: [
				'"use client";',
				'function lt(',
				'let t=document.head',
				'lt(`',
				'var ce=c=>{',
			],
			to: [
				'"use client";let mounted = false;',
				'function lt(container,',
				'let t=container||document.head',
				';const addStyle=(container)=>lt(container,`',
				'var ce=c=>{if(!mounted){mounted=true;addStyle(c.container)};',
			],
		});
		await replace({
			files: 'dist/index.js',
			from: [
				'"use client";',
				'function ct(',
				'let t=document.head',
				'ct(`',
				'var re=s=>{',
			],
			to: [
				'"use client";let mounted = false;',
				'function ct(container,',
				'let t=container||document.head',
				';const addStyle=(container)=>ct(container,`',
				'var ae=s=>{if(!mounted){mounted=true;addStyle(s.container)};',
			],
		});
		await replace({
			files: 'dist/index.d.ts',
			from: 'interface ToasterProps {',
			to: outdent`
				interface ToasterProps {
					container?: HTMLElement;
			`,
		});
	},
});
