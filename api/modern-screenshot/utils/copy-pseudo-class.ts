import type { Context } from './context.ts';
import { getDefaultStyle } from './get-default-style.ts';
import { getDiffStyle } from './get-diff-style.ts';
import { uuid } from './utils.ts';

const pseudoClasses = [
	':before',
	':after',
	// ':placeholder', TODO
];

const scrollbarPseudoClasses = [
	':-webkit-scrollbar',
	':-webkit-scrollbar-button',
	// ':-webkit-scrollbar:horizontal', TODO
	':-webkit-scrollbar-thumb',
	':-webkit-scrollbar-track',
	':-webkit-scrollbar-track-piece',
	// ':-webkit-scrollbar:vertical', TODO
	':-webkit-scrollbar-corner',
	':-webkit-resizer',
];

export function copyPseudoClass<T extends HTMLElement | SVGElement>(
	node: T,
	cloned: T,
	copyScrollbar: boolean,
	context: Context,
) {
	const { ownerWindow, svgStyleElement, svgStyles, currentNodeStyle } = context;

	if (!svgStyleElement || !ownerWindow) return;

	function copyBy(pseudoClass: string) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
		const computedStyle = ownerWindow!.getComputedStyle(node, pseudoClass);
		let content = computedStyle.getPropertyValue('content');

		if (!content || content === 'none') return;

		content = content
			// TODO support css.counter
			.replaceAll(/(')|(")|(counter\(.+\))/g, '');

		const klasses = [uuid()];
		const defaultStyle = getDefaultStyle(node, pseudoClass, context);
		if (currentNodeStyle) {
			for (const [key, _] of currentNodeStyle.entries()) {
				defaultStyle.delete(key);
			}
		}

		const style = getDiffStyle(
			computedStyle,
			defaultStyle,
			context.includeStyleProperties,
		);

		// fix
		style.delete('content');
		style.delete('-webkit-locale');
		// fix background-clip: text
		if (style.get('background-clip')?.[0] === 'text') {
			cloned.classList.add('______background-clip--text');
		}

		const cloneStyle = [
			`content: '${content}';`,
		];

		for (const [name, [value, priority]] of style.entries()) {
			cloneStyle.push(`${name}: ${value}${priority ? ' !important' : ''};`);
		}

		if (cloneStyle.length === 1) return;

		try {
			(cloned as any).className = [(cloned as any).className, ...klasses].join(
				' ',
			);
		} catch {
			return;
		}

		const cssText = cloneStyle.join('\n  ');
		let allClasses = svgStyles.get(cssText);
		if (!allClasses) {
			allClasses = [];
			svgStyles.set(cssText, allClasses);
		}

		allClasses.push(`.${klasses[0]}:${pseudoClass}`);
	}

	for (const pseudoClass of pseudoClasses) {
		copyBy(pseudoClass);
	}

	if (copyScrollbar) {
		for (const pseudoClass of scrollbarPseudoClasses) {
			copyBy(pseudoClass);
		}
	}
}
