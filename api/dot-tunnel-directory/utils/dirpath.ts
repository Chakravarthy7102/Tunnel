import fs from 'node:fs';
import os from 'node:os';
import path from 'pathe';

export async function getDotTunnelDirpath() {
	const dotTunnelDirpath = path.join(os.homedir(), '.tunnel');
	if (!fs.existsSync(dotTunnelDirpath)) {
		await fs.promises.mkdir(dotTunnelDirpath, { recursive: true });
	}

	const dotTunnelDirstat = await fs.promises.stat(dotTunnelDirpath);
	if (!dotTunnelDirstat.isDirectory()) {
		await fs.promises.rm(dotTunnelDirpath, { force: true, recursive: true });
		await fs.promises.mkdir(dotTunnelDirpath, { recursive: true });
	}

	return dotTunnelDirpath;
}

export function getDotTunnelDirpathSync() {
	const dotTunnelDirpath = path.join(os.homedir(), '.tunnel');
	if (!fs.existsSync(dotTunnelDirpath)) {
		fs.mkdirSync(dotTunnelDirpath, { recursive: true });
	}

	const dotTunnelDirstat = fs.statSync(dotTunnelDirpath);
	if (!dotTunnelDirstat.isDirectory()) {
		fs.rmSync(dotTunnelDirpath, { force: true, recursive: true });
		fs.mkdirSync(dotTunnelDirpath, { recursive: true });
	}

	return dotTunnelDirpath;
}
