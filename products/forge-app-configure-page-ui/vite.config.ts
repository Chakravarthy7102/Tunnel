import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { replaceCodePlugin } from 'vite-plugin-replace';

export default defineConfig({
	base: './',
	plugins: [
		react(),
		replaceCodePlugin({
			replacements: [
				{
					from: '{TUNNEL_DOMAIN}',
					to: 'https://tunnel.dev',
				},
			],
		}),
	],
});
