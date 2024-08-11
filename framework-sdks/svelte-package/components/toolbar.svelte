<script lang='ts'>
import { onMount, onDestroy } from 'svelte';
import { RELEASE } from '@-/env/app'

let script: HTMLScriptElement | undefined;

export let projectId: string;
export let branch: string | undefined;

onMount(() => {
	const script = document.createElement('script');

	const src =
		RELEASE === null ?
			'https://tunnelapp.test/__tunnel/script.js' :
			RELEASE === 'staging' ?
			'https://staging.tunnel.dev/__tunnel/script.js' :
			'https://tunnel.dev/__tunnel/script.js';

	script.src = src;
	script.dataset.projectId = projectId;
	if (branch !== undefined) {
		script.dataset.branch = branch;
	}

	script.async = true;

	document.body.append(script);
})

onDestroy(() => {
	script?.remove();
})
</script>
