import { cli } from '@-/cli-helpers';
import { join } from 'desm';
import destr from 'destru';
import fc from 'fast-check';
import pTimeout from 'p-timeout';
import { expect, test } from 'vitest';
import * as http from './utils/http-1.1.ts';

test(
	'works',
	async () => {
		await fc.assert(
			fc.asyncProperty(
				fc
					.record({
						bodySize: fc.integer({ min: 1, max: 20_000 }),
						numTrailers: fc.integer({ min: 0, max: 100 }),
					})
					.chain(({ bodySize, numTrailers }) =>
						fc.record({
							bodySize: fc.constant(bodySize),
							numTrailers: fc.constant(numTrailers),
							nodeChunkSplitLocations: fc
								.array(fc.nat({ max: bodySize }))
								.map((nodeChunkSplitLocations) =>
									nodeChunkSplitLocations.sort((a, b) => a - b)
								),
							httpMessage: http.chunked_body({
								chunkSize: fc.constant(bodySize),
								numTrailers: fc.constant(numTrailers),
							}),
						})
					)
					.chain(({ numTrailers, nodeChunkSplitLocations, httpMessage }) => {
						const nodeChunks: string[] = [];

						let previousSplitLocation = 0;
						for (const nodeChunkSplitLocation of nodeChunkSplitLocations) {
							nodeChunks.push(
								httpMessage.slice(
									previousSplitLocation,
									nodeChunkSplitLocation,
								),
							);
							previousSplitLocation = nodeChunkSplitLocation;
						}

						nodeChunks.push(httpMessage.slice(previousSplitLocation));

						return fc.record({
							nodeChunks: fc.constant(nodeChunks),
							numTrailers: fc.constant(numTrailers),
						});
					}),
				async ({ nodeChunks, numTrailers }) => {
					const { stdout } = await pTimeout(
						cli.pnpm(
							[
								'exec',
								'tsx',
								join(import.meta.url, 'bin/parse-response-body.ts'),
							],
							{
								input: JSON.stringify({ nodeChunks, numTrailers }),
								stdout: 'pipe',
							},
						),
						{
							milliseconds: 5000,
							message:
								'Parsing the HTML body took longer than 5 seconds, likely an infinite loop',
						},
					);

					expect(destr(stdout)).toBe(true);
				},
			),
		);
	},
	{ timeout: Number.POSITIVE_INFINITY },
);
