import * as CSSOM from '@tunnel/cssom';
import pMap, { pMapSkip } from 'p-map';
import type { Context } from './context.ts';
import { hasCssUrl, replaceCssUrlToDataUrl, URL_RE } from './css-url.ts';
import { contextFetch } from './fetch.ts';
import {
	consoleWarn,
	isCssFontFaceRule,
	isCSSImportRule,
	resolveUrl,
	splitFontFamily,
} from './utils.ts';

export async function embedWebFont<T extends Element>(
	clone: T,
	context: Context,
) {
	const {
		ownerDocument,
		svgStyleElement,
		fontFamilies,
		fontCssTexts,
		tasks,
		font,
	} = context;

	if (
		!ownerDocument ||
		!svgStyleElement ||
		// eslint-disable-next-line unicorn/explicit-length-check -- todo
		!fontFamilies.size
	) return;

	if (font && font.cssText) {
		const cssText = filterPreferredFormat(font.cssText, context);
		svgStyleElement.append(ownerDocument.createTextNode(`${cssText}\n`));
	} else {
		const styleSheets: Array<{
			cssRules: CSSRuleList | CSSOM.CSSRule[];
			insertRule(rule: string, index?: number): void;
		}> = await pMap(
			[...ownerDocument.styleSheets],
			async (styleSheet) => {
				try {
					if (
						'cssRules' in styleSheet &&
						styleSheet.cssRules.length > 0
					) {
						return styleSheet;
					} else {
						return pMapSkip;
					}
				} catch (error: any) {
					// If we can't access the cssRules property, it's likely a CORS issue, so we manually fetch and parse the stylesheet contents instead
					if (error.name === 'SecurityError' && styleSheet.href !== null) {
						let text: string;
						try {
							text = await contextFetch(context, {
								url: styleSheet.href,
								requestType: 'text',
								responseType: 'text',
							});
						} catch (error) {
							consoleWarn(
								`Error fetch remote css import from ${styleSheet.href}`,
								error,
							);

							return pMapSkip;
						}

						try {
							return CSSOM.parse(text);
						} catch (error) {
							consoleWarn(
								`Error parsing CSS rules from ${styleSheet.href}`,
								error,
							);

							return pMapSkip;
						}
					} else {
						consoleWarn(
							`Error while reading CSS rules from ${styleSheet.href}`,
							error,
						);
						return pMapSkip;
					}
				}
			},
		);

		await Promise.all(
			styleSheets.flatMap((styleSheet) => {
				return [...styleSheet.cssRules].map(async (cssRule, index) => {
					if (isCSSImportRule(cssRule)) {
						let importIndex = index + 1;
						const baseUrl = cssRule.href;
						let cssText = '';
						try {
							cssText = await contextFetch(context, {
								url: baseUrl,
								requestType: 'text',
								responseType: 'text',
							});
						} catch (error) {
							consoleWarn(
								`Error fetch remote css import from ${baseUrl}`,
								error,
							);
						}

						const replacedCssText = cssText.replace(
							URL_RE,
							(raw, quotation, url) =>
								raw.replace(url, resolveUrl(url, baseUrl)),
						);
						for (const rule of parseCss(replacedCssText)) {
							try {
								styleSheet.insertRule(
									rule,
									rule.startsWith('@import') ?
										(importIndex += 1) :
										styleSheet.cssRules.length,
								);
							} catch (error) {
								consoleWarn('Error inserting rule from remote css import', {
									rule,
									error,
								});
							}
						}
					}
				});
			}),
		);

		const cssRules = styleSheets.flatMap((
			styleSheet,
		) => [...styleSheet.cssRules]);

		for (
			const value of cssRules
				.filter((cssRule) => (
					isCssFontFaceRule(cssRule) &&
					hasCssUrl(cssRule.style.getPropertyValue('src')) &&
					splitFontFamily(cssRule.style.getPropertyValue('font-family'))
						?.some((val) => fontFamilies.has(val))
				))
		) {
			const rule = value as CSSFontFaceRule;
			const cssText = fontCssTexts.get(rule.cssText);
			if (cssText) {
				svgStyleElement.append(
					ownerDocument.createTextNode(`${cssText}\n`),
				);
			} else {
				tasks.push(
					replaceCssUrlToDataUrl(
						rule.cssText,
						rule.parentStyleSheet ?
							rule.parentStyleSheet.href :
							null,
						context,
					).then((cssText) => {
						cssText = filterPreferredFormat(cssText, context);
						fontCssTexts.set(rule.cssText, cssText);
						svgStyleElement.append(
							ownerDocument.createTextNode(`${cssText}\n`),
						);
					}),
				);
			}
		}
	}
}

const COMMENTS_RE = /(\/\*[\S\s]*?\*\/)/gi;
const KEYFRAMES_RE = /((@.*?keyframes [\S\s]*?){([\S\s]*?}\s*?)})/gi;

function parseCss(source: string) {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
	if (source === null || source === undefined) return [];
	const result: string[] = [];
	let cssText = source.replaceAll(COMMENTS_RE, '');
	for (;;) {
		const matches = KEYFRAMES_RE.exec(cssText);
		if (!matches) break;
		result.push(matches[0]);
	}

	cssText = cssText.replaceAll(KEYFRAMES_RE, '');
	// to match css & media queries together
	const IMPORT_RE = /@import[\S\s]*?url\([^)]*\)[\S\s]*?;/gi;
	const UNIFIED_RE = new RegExp(
		'((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' +
			'*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})',
		'gi',
	);

	for (;;) {
		let matches = IMPORT_RE.exec(cssText);
		if (!matches) {
			matches = UNIFIED_RE.exec(cssText);
			if (!matches) {
				break;
			} else {
				IMPORT_RE.lastIndex = UNIFIED_RE.lastIndex;
			}
		} else {
			UNIFIED_RE.lastIndex = IMPORT_RE.lastIndex;
		}

		result.push(matches[0]);
	}

	return result;
}

const URL_WITH_FORMAT_RE = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
const FONT_SRC_RE = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;

function filterPreferredFormat(
	str: string,
	context: Context,
): string {
	const { font } = context;

	const preferredFormat = font ?
		font.preferredFormat :
		undefined;

	return preferredFormat ?
		str.replaceAll(FONT_SRC_RE, (match: string) => {
			for (;;) {
				const [src, , format] = URL_WITH_FORMAT_RE.exec(match) ?? [];
				if (!format) return '';
				if (format === preferredFormat) return `src: ${src};`;
			}
		}) :
		str;
}
