import { dotTunnelJsonSchema } from '#schemas/dot-tunnel-json.ts';
import { getDefaultDotTunnelJson } from '#utils/default.ts';
import { logger } from '@-/logger';
import { createFlatNamespace } from '@tunnel/namespace';
import { destr } from 'destru';
import { $try, ok, ResultAsync } from 'errok';
import fs from 'node:fs';
import * as methods from './_.methods.ts';

const classMethods = createFlatNamespace('DotTunnelJsonFileManager', methods);

class DotTunnelJsonFileManagerClass {
	private constructor() {
		Object.assign(this, classMethods);
	}

	dotTunnelJsonFilepath!: string;

	// TODO: make sure this doesn't get called concurrently
	static create({
		dotTunnelJsonFilepath,
	}: {
		dotTunnelJsonFilepath: string;
	}) {
		return $try(async function*() {
			const self =
				new DotTunnelJsonFileManagerClass() as DotTunnelJsonFileManager;

			self.dotTunnelJsonFilepath = dotTunnelJsonFilepath;

			const writeDefaultDotTunnelJson = () => (ResultAsync.fromPromise(
				fs.promises.writeFile(
					self.dotTunnelJsonFilepath,
					JSON.stringify(getDefaultDotTunnelJson()),
				),
				(error) =>
					new Error(
						`Failed to save ".tunnel.json" to disk: ${String(error)}`,
					),
			));

			if (!fs.existsSync(self.dotTunnelJsonFilepath)) {
				yield* writeDefaultDotTunnelJson().safeUnwrap();
			}

			// const releaseLock = await lockfile.lock(self.dotTunnelJsonFilepath);

			const dotTunnelJson = await fs.promises.readFile(
				self.dotTunnelJsonFilepath,
				'utf8',
			);

			// Make sure that the `.tunnel.json` format is valid
			const dotTunnelJsonParseResult = dotTunnelJsonSchema.safeParse(
				destr(dotTunnelJson),
			);

			if (!dotTunnelJsonParseResult.success) {
				logger.debug('Invalid `.tunnel.json` object, resetting to default');
				yield* writeDefaultDotTunnelJson().safeUnwrap();
			}

			return ok(self);
		});
	}
}

export type DotTunnelJsonFileManager =
	& DotTunnelJsonFileManagerClass
	& typeof classMethods;
export const DotTunnelJsonFileManager = DotTunnelJsonFileManagerClass;
