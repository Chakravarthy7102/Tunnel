import { dotTunnelJsonSchema } from '#schemas/dot-tunnel-json.ts';
import type { DotTunnelJson } from '#types';
import { getDefaultDotTunnelJson } from '#utils/default.ts';
import { logger } from '@-/logger';
import { destr } from 'destru';
import fs from 'node:fs';
import type { DotTunnelJsonFileManager } from './_class.ts';

export async function DotTunnelJsonFileManager_read(
	this: DotTunnelJsonFileManager,
): Promise<DotTunnelJson> {
	// const releaseLock = await lockfile.lock(this.dotTunnelJsonFilepath);

	try {
		if (!fs.existsSync(this.dotTunnelJsonFilepath)) {
			await fs.promises.writeFile(
				this.dotTunnelJsonFilepath,
				JSON.stringify(getDefaultDotTunnelJson()),
			);
		}

		const dotTunnelJsonFileContents = await fs.promises.readFile(
			this.dotTunnelJsonFilepath,
			'utf8',
		);

		const dotTunnelJsonParseResult = dotTunnelJsonSchema.safeParse(
			destr(dotTunnelJsonFileContents),
		);
		if (!dotTunnelJsonParseResult.success) {
			process.stderr.write(
				'Failed to parse `.tunnel.json`; resetting to default\n',
			);
			await fs.promises.writeFile(
				this.dotTunnelJsonFilepath,
				JSON.stringify(getDefaultDotTunnelJson()),
			);
			return getDefaultDotTunnelJson();
		}

		return dotTunnelJsonParseResult.data;
	} finally {
		// await releaseLock();
	}
}

export async function DotTunnelJsonFileManager_update(
	this: DotTunnelJsonFileManager,
	updateCallback: (dotTunnelJson: DotTunnelJson) => void,
) {
	// const releaseLock = await lockfile.lock(this.dotTunnelJsonFilepath);

	try {
		if (!fs.existsSync(this.dotTunnelJsonFilepath)) {
			await fs.promises.writeFile(
				this.dotTunnelJsonFilepath,
				JSON.stringify(getDefaultDotTunnelJson()),
			);
		}

		const dotTunnelJsonFileContents = await fs.promises.readFile(
			this.dotTunnelJsonFilepath,
			'utf8',
		);

		const dotTunnelJson = await (async () => {
			const dotTunnelJsonParseResult = dotTunnelJsonSchema.safeParse(
				destr(dotTunnelJsonFileContents),
			);
			if (!dotTunnelJsonParseResult.success) {
				logger.debug('Failed to parse `.tunnel.json`; resetting to default\n');
				await fs.promises.writeFile(
					this.dotTunnelJsonFilepath,
					JSON.stringify(getDefaultDotTunnelJson()),
				);
				return getDefaultDotTunnelJson();
			}

			return dotTunnelJsonParseResult.data;
		})();

		updateCallback(dotTunnelJson);

		await fs.promises.writeFile(
			this.dotTunnelJsonFilepath,
			JSON.stringify(dotTunnelJson, null, '\t'),
		);
	} finally {
		// await releaseLock();
	}
}
