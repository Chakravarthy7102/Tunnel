<script setup lang='ts'>
import { onMounted, onUnmounted, useAttrs } from 'vue';
let script: HTMLScriptElement | undefined;

const { projectId, branch } = defineProps<{
	projectId: string;
	branch?: string
}>();

const attrs = useAttrs()

onMounted(() => {
	const script = document.createElement('script');

	const src =
		'release' in attrs && attrs.release === null ?
			'https://tunnel.test/__tunnel/script.js' :
			'release' in attrs && attrs.release === 'staging' ?
			'https://staging.tunnel.dev/__tunnel/script.js' :
			'https://tunnel.dev/__tunnel/script.js';

	script.src = src;
	script.dataset.projectId = projectId;
	if (branch !== undefined) {
		script.dataset.branch = branch;
	}

	if ('release' in attrs && attrs.release !== null) {
		script.dataset.release = String(attrs.release);
	}

	script.async = true;

	document.body.append(script);
})

onUnmounted(() => {
	script?.remove();
})
</script>
