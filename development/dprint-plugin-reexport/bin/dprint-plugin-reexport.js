#!/usr/bin/env node

import { getMonorepoDirpath } from 'get-monorepo-root';
import getStdin from 'get-stdin';
import { createGlobfileManager } from 'glob-imports';

const stdin = await getStdin();
if (!stdin.includes('// dprint-reexport')) {
	process.stdout.write(stdin);
	process.exit(0);
}

// Find the "// dprint-reexport" line
const fileLines = stdin.split('\n');
const dprintReexportLineIndex = fileLines.findIndex((line) =>
	line.startsWith('// dprint-reexport')
);
const dprintReexportEndLineIndex = fileLines.findIndex((line) =>
	line.startsWith('// dprint-reexport end')
);

if (dprintReexportLineIndex === -1) {
	process.stdout.write(stdin);
	process.exit(0);
}

const dprintReexportLine = fileLines[dprintReexportLineIndex];
const filepath = process.argv[2];
const pluginArgs = dprintReexportLine.split(' ');
const globPattern = pluginArgs[2];
const globfileType =
	pluginArgs.find((arg) => arg.startsWith('--type='))?.replace('--type=', '') ??
		'matches';
const moduleType =
	pluginArgs.find((arg) => arg.startsWith('--module='))?.replace(
		'--module=',
		'',
	) ?? 'module';

const monorepoDirpath = getMonorepoDirpath(filepath);
const { getGlobfileContents, getGlobfilePath } = createGlobfileManager({
	monorepoDirpath,
});

let formattedFileLines = fileLines
	.slice(0, dprintReexportLineIndex)
	.join('\n') +
	dprintReexportLine + '\n' + getGlobfileContents({
		globfilePath: getGlobfilePath({
			globfileModuleSpecifier: `glob${
				globfileType === 'matches' ? '' : `[${globfileType}]`
			}:${globPattern}`,
			importerFilepath: filepath,
		}),
		importerFilepath: filepath,
		filepathType: 'relative',
		moduleType,
	});

if (dprintReexportEndLineIndex !== -1) {
	formattedFileLines += '\n' +
		fileLines.slice(dprintReexportEndLineIndex).join('\n');
}

process.stdout.write(formattedFileLines);
