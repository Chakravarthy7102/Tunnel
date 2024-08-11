import { createPatchFileReplacer } from '#utils/patch.ts';
import { outdent } from 'outdent';

export async function patchInputParser({
	temporaryPatchDirectory,
}: {
	temporaryPatchDirectory: string;
}) {
	const replace = createPatchFileReplacer({ temporaryPatchDirectory });

	// Support passing functions into `.input()`
	await replace({
		files: [
			'src/unstable-core-do-not-import/parser.ts',
			'dist/unstable-core-do-not-import/parser.d.ts',
		],
		from: outdent`
			export type Parser = ParserWithInputOutput<any, any> | ParserWithoutInput<any>;
		`,
		to: outdent`
			type Parser = ParserWithInputOutput<any, any> | ParserWithoutInput<any> | ((input: unknown, ctx: any) => ParserWithInputOutput<any, any> | ParserWithoutInput<any> );
		`,
	});

	await replace({
		files: [
			'src/unstable-core-do-not-import/parser.ts',
			'dist/unstable-core-do-not-import/parser.d.ts',
		],
		from: outdent`
			type inferParser<TParser extends Parser> =
				TParser extends ParserWithInputOutput<infer $TIn, infer $TOut>
					? {
							in: $TIn;
							out: $TOut;
						}
					: TParser extends ParserWithoutInput<infer $InOut>
					? {
							in: $InOut;
							out: $InOut;
						}
					: never;
		`,
		to: outdent`
			type inferParser<TParser extends Parser> =
				TParser extends (input: unknown, ctx: any) => infer $Parser
					? inferParser<$Parser>
					: TParser extends ParserWithInputOutput<infer $TIn, infer $TOut>
						? {
								in: $TIn;
								out: $TOut;
							}
						: TParser extends ParserWithoutInput<infer $InOut>
						? {
								in: $InOut;
								out: $InOut;
							}
						: never;
		`,
	});

	// Support passing `ctx` into `.input()` validators
	await replace({
		files: [
			'src/unstable-core-do-not-import/parser.ts',
			'dist/unstable-core-do-not-import/parser.d.ts',
		],
		from: [
			outdent`
				export type ParserCustomValidatorEsque<TInput> = (input: unknown) => TInput | Promise<TInput>;
			`,
			outdent`
				type ParseFn<TType> = (value: unknown) => Promise<TType> | TType;
			`,
		],
		to: [
			outdent`
				export type ParserCustomValidatorEsque<TInput> = (input: unknown, ctx: any) => TInput | Promise<TInput>;
			`,
			outdent`
				type ParseFn<TType> = (value: unknown, ctx: any) => Promise<TType> | TType;
			`,
		],
	});

	await replace({
		files: [
			'dist/unstable-core-do-not-import/middleware.js',
			'dist/unstable-core-do-not-import/middleware.mjs',
			'src/unstable-core-do-not-import/middleware.ts',
		],
		from: outdent`
			parsedInput = await parse(rawInput);
		`,
		to: outdent`
			parsedInput = await parse(rawInput, opts.ctx);
			// In case our parse function returns a Zod schema
			if (typeof parsedInput.parseAsync === 'function') {
				parsedInput = await parsedInput.parseAsync(rawInput, opts.ctx);
			} else if (typeof parsedInput.parse === 'function') {
				parsedInput = await parsedInput.parse(rawInput, opts.ctx);
			}
		`,
	});
}
