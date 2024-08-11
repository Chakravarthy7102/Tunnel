import fs from 'node:fs';

export function createStaticResourceGetter(
	args:
		& {
			resourcePath: string;
		}
		& (
			| {
				appEnv: 'production';
			}
			| {
				appEnv: 'development';
				build(): Promise<void>;
			}
		),
) {
	if (args.appEnv === 'production') {
		if (!fs.existsSync(args.resourcePath)) {
			throw new Error(`Missing static resource: ${args.resourcePath}`);
		}

		const resource = fs.readFileSync(args.resourcePath, 'utf8');
		return () => resource;
	} else {
		return async () => {
			await args.build();
			return fs.promises.readFile(args.resourcePath, 'utf8');
		};
	}
}
