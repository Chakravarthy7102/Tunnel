import path from 'pathe';

const envSetterRegex = /^(\w+)=('(.*)'|"(.*)"|(.*))$/;

/**
	Taken from https://github.com/kentcdodds/cross-env/blob/master/index.js#L42C2-L84C2

	Probably doesn't work with Windows commands though
*/
export function parseCommand(args: string[]) {
	const envSetters: Record<string, string> = {};
	let command = null;
	let commandArgs: string[] = [];
	for (let i = 0; i < args.length; i++) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Fix
		const match = envSetterRegex.exec(args[i]!);
		if (match) {
			let value!: string;

			if (match[3] !== undefined) {
				value = match[3];
			} else if (match[4] === undefined) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Works
				value = match[5]!;
			} else {
				value = match[4];
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
			envSetters[match[1]!] = value;
		} else {
			// No more env setters, the rest of the line must be the command and args
			let cStart = [];
			cStart = args
				.slice(i)
				// Regex:
				// match "\'" or "'"
				// or match "\" if followed by [$"\] (lookahead)
				.map((a) => {
					const re = /\\\\|(\\)?'|(\\)(?=["$\\])/g;
					// Eliminate all matches except for "\'" => "'"
					return a.replaceAll(re, (m: string) => {
						if (m === '\\\\') return '\\';
						if (m === "\\'") return "'";
						return '';
					});
				});
			command = cStart[0];
			commandArgs = cStart.slice(1);
			break;
		}
	}

	return [envSetters, command, commandArgs] as const;
}

const isWindows = () =>
	process.platform === 'win32' ||
	/^(msys|cygwin)$/.test(process.env.OSTYPE ?? '');

/**
	Converts an environment variable usage to be appropriate for the current OS
	@param {String} command Command to convert
	@param {Object} env Map of the current environment variable names and their values
	@param {boolean} normalize If the command should be normalized using `path`
	after converting
	@returns {String} Converted command
*/
export function commandConvert(
	command: string,
	env: Record<string, string>,
	normalize = false,
) {
	if (!isWindows()) {
		return command;
	}

	const envUnixRegex = /\$(\w+)|\${(\w+)}/g; // $my_var or ${my_var}
	const convertedCmd = command.replaceAll(envUnixRegex, (match, $1, $2) => {
		const varName = $1 || $2;
		// In Windows, non-existent variables are not replaced by the shell,
		// so for example "echo %FOO%" will literally print the string "%FOO%", as
		// opposed to printing an empty string in UNIX. See kentcdodds/cross-env#145
		// If the env variable isn't defined at runtime, just strip it from the command entirely
		return env[varName] ? `%${varName}%` : '';
	});
	// Normalization is required for commands with relative paths
	// For example, `./cmd.bat`. See kentcdodds/cross-env#127
	// However, it should not be done for command arguments.
	// See https://github.com/kentcdodds/cross-env/pull/130#issuecomment-319887970
	return normalize === true ? path.normalize(convertedCmd) : convertedCmd;
}

export function getEnvVars(
	envSetters: Record<string, string>,
): Record<string, string> {
	const envVars = { ...process.env } as Record<string, string>;
	if (process.env.APPDATA) {
		envVars.APPDATA = process.env.APPDATA;
	}

	for (const [varName, envValue] of Object.entries(envSetters)) {
		envVars[varName] = varValueConvert(envValue, varName);
	}

	return envVars;
}

const pathLikeEnvVarWhitelist = new Set(['PATH', 'NODE_PATH']);

/**
	This will transform UNIX-style list values to Windows-style.
	For example, the value of the $PATH variable "/usr/bin:/usr/local/bin:."
	will become "/usr/bin;/usr/local/bin;." on Windows.
	@param varValue Original value of the env variable
	@param varName Original name of the env variable
	@returns Converted value
 */
function replaceListDelimiters(varValue: string, varName = ''): string {
	const targetSeparator = isWindows() ? ';' : ':';
	if (!pathLikeEnvVarWhitelist.has(varName)) {
		return varValue;
	}

	return varValue.replaceAll(/(\\*):/g, (match, backslashes) => {
		if (backslashes.length % 2) {
			// Odd number of backslashes preceding it means it's escaped,
			// remove 1 backslash and return the rest as-is
			return match.slice(1);
		}

		return backslashes + targetSeparator;
	});
}

/**
	This will attempt to resolve the value of any env variables that are inside
	this string. For example, it will transform this:
	cross-env FOO=$NODE_ENV BAR=\\$NODE_ENV echo $FOO $BAR
	Into this:
	FOO=development BAR=$NODE_ENV echo $FOO
	(Or whatever value the variable NODE_ENV has)
	Note that this function is only called with the right-side portion of the
	env var assignment, so in that example, this function would transform
	the string "$NODE_ENV" into "development"
	@param varValue Original value of the env variable
	@returns Converted value
 */
function resolveEnvVars(varValue: string): string {
	const envUnixRegex = /(\\*)(\$(\w+)|\${(\w+)})/g; // $my_var or ${my_var} or \$my_var
	return varValue.replaceAll(
		envUnixRegex,
		// eslint-disable-next-line max-params -- This is String#replace
		(_, escapeChars, varNameWithDollarSign, varName, altVarName) => {
			// do not replace things preceded by a odd number of \
			if (escapeChars.length % 2 === 1) {
				return varNameWithDollarSign;
			}

			return (
				escapeChars.slice(0, Math.max(0, escapeChars.length / 2)) +
				(process.env[varName || altVarName] ?? '')
			);
		},
	);
}

/**
	Converts an environment variable value to be appropriate for the current OS.
	@param originalValue Original value of the env variable
	@param originalName Original name of the env variable
	@returns Converted value
*/
function varValueConvert(originalValue: string, originalName: string) {
	return resolveEnvVars(replaceListDelimiters(originalValue, originalName));
}
