import { defineProjectConfig } from '#utils/project.js';
import { cli } from '@-/cli-helpers';

export default defineProjectConfig({
	port: 3000,
	async install() {
		await cli.npm('install', {
			cwd: this.fixtureDirpath,
		});
	},
	async getStartCommand() {
		return `${await cli.node.getExecutablePath()} server.js`;
	},
});
