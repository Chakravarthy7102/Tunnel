import { defineBinStub } from '#utils/define.ts';
import { packageDirpaths } from '@-/packages-config';
import { join } from 'desm';
import esbuild from 'esbuild';
import escapesh from 'escapesh';
import { resolve } from 'import-meta-resolve';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'pathe';

export const node = defineBinStub({
	commandName: 'node',
	async getStub({ release }) {
		await esbuild.build({
			entryPoints: [join(import.meta.url, 'entry-script.ts')],
			bundle: true,
			platform: 'node',
			format: 'cjs',
			target: 'node14',
			outdir: path.join(packageDirpaths.binStubs, '.build'),
		});

		const entryScriptCode = await fs.promises.readFile(
			path.join(packageDirpaths.binStubs, '.build/entry-script.js'),
			'utf8',
		);

		const escapedNodeEntryScript = escapesh(entryScriptCode);

		const tunnelLoaderPath = fileURLToPath(
			resolve('tsx', import.meta.url),
		);

		return String.raw`#!/bin/sh

##########################################################################
# DO NOT EDIT DIRECTLY; this file is generated by \`bin-stubs/generate\` #
##########################################################################

# Store the args passed to \`node\`
node_args=$@

# Get all the possible interpretations of 'node'
interpretations=$(type -a node 2>/dev/null)

# Initialize a variable to store the path
node_path=""

# Change IFS to split the string into lines
IFS=$'\n'
# Convert the multiline string into a list of lines
set -- $interpretations
# Restore the original IFS
IFS=" "

# Iterate over the lines
for line in "$@"; do
	# Check if the line indicates a file path
	case "$line" in
		"node is "*)
			current_path="${'$'}{line#node is }"
			# Check if the path does NOT end in '/__stubs__/node'
			case "$current_path" in
				*/__stubs__/node)
					: ;;  # Do nothing if it ends with '/__stubs__/node'
				*)
					# If a valid path is found, store in 'path' and exit the loop
					node_path="$current_path"
					break
					;;
			esac
			;;
	esac
done

if [ -n "$node_path" ]; then
	if [ -n "$node_args" ]; then
		printf '%s' ${escapedNodeEntryScript} | ${
			release === null ?
				`NODE_OPTIONS='--import ${tunnelLoaderPath}' ` :
				''
		}"$node_path" - $node_args
	else
		"$node_path"
	fi
else
	echo "node: command not found"
	exit 127
fi
`;
	},
});
