import { defineProcedure } from '#utils/procedure.ts';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import * as acorn from 'acorn';
import tsPlugin from 'acorn-typescript';
import { ok } from 'errok';
import { walk } from 'estree-walker';
import fs from 'node:fs';
import { simpleGit } from 'simple-git';

export const file_read = defineProcedure({
	input: z.object({
		filepath: z.string(),
	}),
	async query({ input: { filepath } }) {
		const fileContents = await fs.promises.readFile(filepath, 'utf8');
		return ok(fileContents);
	},
	error: ({ error, input }) =>
		new ProcedureError(
			`There was an error reading the file at ${input.filepath}`,
			error,
		),
});

export const file_write = defineProcedure({
	input: z.object({
		filepath: z.string(),
		fileContents: z.string(),
	}),
	async mutation({ input: { filepath, fileContents } }) {
		await fs.promises.writeFile(filepath, fileContents);
		return ok();
	},
	error: ({ error, input }) =>
		new ProcedureError(
			`There was an error writing to ${input.filepath}`,
			error,
		),
});

export const file_getComponent = defineProcedure({
	input: z.object({
		filePath: z.string(),
		lineNumber: z.number(),
		columnNumber: z.number(),
	}),
	async query({ input: { filePath, lineNumber, columnNumber } }) {
		const fileContents = await fs.promises.readFile(filePath, 'utf8');
		const node = acorn.Parser.extend((tsPlugin as any)()).parse(fileContents, {
			sourceType: 'module',
			ecmaVersion: 'latest',
			locations: true,
		});

		let nodeText = '';
		let foundNode: any;

		walk(node as any, {
			enter(node: any) {
				if (
					!foundNode &&
					node.loc &&
					node.loc.start.line === lineNumber &&
					node.loc.start.column === columnNumber
				) {
					foundNode = node;

					nodeText = fileContents.slice(
						node.start as number,
						(node.end as number) + 1,
					);
				}
			},
		});

		return ok(nodeText);
	},
	error: ({ error, input }) =>
		new ProcedureError(
			`There was an error getting the component at ${input.filePath}:${input.lineNumber}:${input.columnNumber}`,
			error,
		),
});

export const file_patch = defineProcedure({
	input: z.object({
		patch: z.string(),
	}),
	async mutation({ input: { patch } }) {
		const simple = simpleGit();
		await simple.applyPatch(patch);
		return ok();
	},
	error: ({ error }) =>
		new ProcedureError(
			'There was an error applying the patch',
			error,
		),
});
