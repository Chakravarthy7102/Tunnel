import { cli } from '@-/cli-helpers';

import { defineProjectConfig } from '../../../utils/project.js';

export default defineProjectConfig({
	port: 3000,
	async install() {
		await cli.npm('install', {
			cwd: this.fixtureDirpath
		});
	},
	async getStartCommand() {
		return `${await cli.pnpm.getExecutablePath()} run dev`;
	}
});
