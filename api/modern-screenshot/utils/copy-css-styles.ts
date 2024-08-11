import type { Context } from './context.ts';
import { getDefaultStyle } from './get-default-style.ts';
import { getDiffStyle } from './get-diff-style.ts';
import { IN_CHROME } from './utils.ts';

export function copyCssStyles<T extends HTMLElement | SVGElement>(
	node: T,
	cloned: T,
	isRoot: boolean,
	context: Context,
) {
	const {
		ownerWindow,
		includeStyleProperties,
		currentParentNodeStyle,
		scrollX,
		scrollY,
	} = context;
	const clonedStyle = cloned.style;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
	const computedStyle = ownerWindow!.getComputedStyle(node);
	const defaultStyle = getDefaultStyle(node, null, context);
	if (currentParentNodeStyle) {
		for (const [key, _] of currentParentNodeStyle.entries()) {
			defaultStyle.delete(key);
		}
	}

	const style = getDiffStyle(
		computedStyle,
		defaultStyle,
		includeStyleProperties,
	);

	// fix
	style.delete('transition-property');
	style.delete('all'); // svg: all
	style.delete('d'); // svg: d
	style.delete('content'); // Safari shows pseudoelements if content is set
	if (isRoot) {
		const marginProperties = [
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block-start',
			'margin-block-end',
			'margin-inline-start',
			'margin-inline-end',
		];

		for (const marginProperty of marginProperties) {
			if (style.get(marginProperty)?.[0] !== '0px') {
				style.delete(marginProperty);
			}
		}

		style.set('box-sizing', ['border-box', '']);
	}

	if (style.get('position')?.[0] === 'fixed') {
		// Update the transform style (but don't overwrite it)
		const transform = style.get('transform')?.[0] ?? '';
		style.set('transform', [
			`${transform} translate(${scrollX}px, ${scrollY}px)`,
			'',
		]);
	}

	// fix background-clip: text
	if (style.get('background-clip')?.[0] === 'text') {
		cloned.classList.add('______background-clip--text');
	}

	// fix chromium
	// https://github.com/RigoCorp/html-to-image/blob/master/src/cssFixes.ts
	if (IN_CHROME) {
		if (!style.has('font-kerning')) style.set('font-kerning', ['normal', '']);

		if (
			(
				style.get('overflow-x')?.[0] === 'hidden' ||
				style.get('overflow-y')?.[0] === 'hidden'
			) &&
			style.get('text-overflow')?.[0] === 'ellipsis' &&
			node.scrollWidth === node.clientWidth
		) {
			style.set('text-overflow', ['clip', '']);
		}
	}

	for (const [name, [value, priority]] of style.entries()) {
		clonedStyle.setProperty(name, value, priority);
	}

	return style;
}
