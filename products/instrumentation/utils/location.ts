import type { FunctionLocation } from '#types';

export interface Options {
	check: (location: FunctionLocation) => boolean;
	/**
	 * once we have satisfied the found condition, if any, then apply this index offset to the frames
	 * e.g. 1 would mean next frame, and -1 would mean the previous frame
	 * Use -1 to go back to the found method or file
	 */
	frames?: number;
	/**
	 * once we have satisfied the found condition, should we apply the frame offset immediately, or wait until the found condition has exited
	 */
	immediate?: boolean;
}

/**
 * For an error instance, return its stack frames as an array.
 */
export function getFramesFromError(error: Error): string[] {
	// Create an error
	let stack: Error['stack'] | null;
	let frames: any[];

	// And attempt to retrieve it's stack
	// https://github.com/winstonjs/winston/issues/401#issuecomment-61913086
	try {
		stack = error.stack;
	} catch {
		try {
			// @ts-expect-error -- global error
			const previous = err.__previous__ || err.__previous;
			stack = previous?.stack;
		} catch {
			stack = null;
		}
	}

	// Handle different stack formats
	if (stack) {
		if (Array.isArray(stack)) {
			// eslint-disable-next-line unicorn/no-new-array -- TODO
			frames = new Array(stack);
		} else {
			frames = stack.toString().split('\n');
		}
	} else {
		frames = [];
	}

	// Parse our frames
	return frames;
}

const lineRegex =
	/\s+at\s(?:(?<method>.+?)\s\()?(?<file>.+?):(?<line>\d+):(?<char>\d+)\)?\s*$/;

/**
 * Get the locations from a list of error stack frames.
 */
export function getLocationsFromFrames(frames: string[]): FunctionLocation[] {
	// Prepare
	const locations: FunctionLocation[] = [];

	// Cycle through the lines
	for (const frame of frames) {
		// ensure each line is a string
		const line = (frame || '').toString();

		// skip empty lines
		if (line.length === 0) continue;

		// Error
		// at file:///Users/balupton/Projects/active/get-current-line/asd.js:1:13
		// at ModuleJob.run (internal/modules/esm/module_job.js:140:23)
		// at async Loader.import (internal/modules/esm/loader.js:165:24)
		// at async Object.loadESM (internal/process/esm_loader.js:68:5)
		const match = line.match(lineRegex);
		if (match?.groups !== undefined) {
			locations.push({
				method: match.groups.method ?? '',
				file: match.groups.file ?? '',
				line: Number(match.groups.line),
				char: Number(match.groups.char),
			});
		}
	}

	return locations;
}

/**
 * From a list of locations, get the location that is determined by the offset.
 * If none are found, return the failure location
 */
export function getLocationWithOffset(
	locations: FunctionLocation[],
	options: Options,
): FunctionLocation | null {
	let found = false;

	// use while loop so we can skip ahead
	let i = 0;
	while (i < locations.length) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- u
		const location = locations[i]!;

		// the current location matches the offset
		if (options.check(location)) {
			if (options.immediate) {
				// apply frame offset
				i += options.frames ?? 0;
				// and return the result
				return locations[i] ?? null;
			} // otherwise, continue until the found condition has exited
			else {
				found = true;
				++i;
				continue;
			}
		} // has been found, and the found condition has exited, so return with the frame offset applied
		else if (found) {
			// apply frame offset
			i += options.frames ?? 0;
			return locations[i] ?? null;
		} // nothing has been found yet, so continue until we find the offset
		else {
			++i;
			continue;
		}
	}

	return null;
}

/**
 * Get each error stack frame's location information.
 */
function getLocationsFromError(error: Error): FunctionLocation[] {
	const frames = getFramesFromError(error);
	return getLocationsFromFrames(frames);
}

/**
 * Get first determined location information that appears in the stack of the error.
 * If no offset is provided, then the offset used will determine the first location information.
 */
export function getLocationFromError(
	error: Error,
	options: Options,
): FunctionLocation | null {
	const locations = getLocationsFromError(error);
	return getLocationWithOffset(locations, options);
}

export default function getCurrentLine(
	options: Options,
): FunctionLocation | null {
	return null;

	// TODO: `new Error()` results in a memory leak
	// eslint-disable-next-line unicorn/error-message -- Used for stacktrace
	return getLocationFromError(new Error(), options);
}
