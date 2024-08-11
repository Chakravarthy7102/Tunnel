import { cloneNode } from '#utils/clone-node.ts';
import type { Context } from '#utils/context.ts';
import { orCreateContext } from '#utils/create-context.ts';
import { destroyContext } from '#utils/destroy-context.ts';
import { embedNode } from '#utils/embed-node.ts';
import { embedWebFont } from '#utils/embed-web-font.ts';
import type { Options } from '#utils/options.ts';
import {
	consoleWarn,
	createSvg,
	isElementNode,
	isSVGElementNode,
} from '#utils/utils.ts';

export async function domToForeignObjectSvg<T extends Node>(
	node: T,
	options?: Options,
): Promise<SVGElement>;
export async function domToForeignObjectSvg<T extends Node>(
	context: Context<T>,
): Promise<SVGElement>;
export async function domToForeignObjectSvg(node: any, options?: any) {
	const context = await orCreateContext(node, options);

	if (isElementNode(context.node) && isSVGElementNode(context.node)) {
		return context.node;
	}

	const {
		ownerDocument,
		log,
		tasks,
		svgStyleElement,
		svgDefsElement,
		svgStyles,
		font,
		progress,
		autoDestruct,
		onCloneNode,
		onEmbedNode,
		onCreateForeignObjectSvg,
	} = context;

	log.time('clone node');
	const clone = await cloneNode(context.node, context, true);
	if (svgStyleElement && ownerDocument) {
		let allCssText = '';
		for (const [cssText, klasses] of svgStyles.entries()) {
			allCssText += `${klasses.join(',\n')} {\n  ${cssText}\n}\n`;
		}

		svgStyleElement.append(ownerDocument.createTextNode(allCssText));
	}

	log.timeEnd('clone node');

	onCloneNode?.(clone);

	if (font !== false && isElementNode(clone)) {
		log.time('embed web font');
		await embedWebFont(clone, context);
		log.timeEnd('embed web font');
	}

	log.time('embed node');
	embedNode(clone, context);
	const count = tasks.length;
	let current = 0;
	const runTask = async () => {
		for (;;) {
			const task = tasks.pop();
			if (!task) break;
			try {
				// eslint-disable-next-line no-await-in-loop -- Need to run tasks in order
				await task;
			} catch (error) {
				consoleWarn('Failed to run task', error);
			}

			progress?.(++current, count);
		}
	};

	progress?.(current, count);
	await Promise.all(Array.from({ length: 4 }).map(runTask));
	log.timeEnd('embed node');

	onEmbedNode?.(clone);

	const svg = createForeignObjectSvg(clone, context);
	if (svgDefsElement) {
		svg.insertBefore(svgDefsElement, svg.children[0] ?? null);
	}

	if (svgStyleElement) {
		svg.insertBefore(svgStyleElement, svg.children[0] ?? null);
	}

	if (autoDestruct) {
		destroyContext(context);
	}

	onCreateForeignObjectSvg?.(svg);

	return svg;
}

function createForeignObjectSvg(clone: Node, context: Context): SVGSVGElement {
	const { width, height, crop } = context;
	const svg = createSvg({
		width,
		height,
		crop,
		ownerDocument: clone.ownerDocument,
	});
	const foreignObject = svg.ownerDocument.createElementNS(
		svg.namespaceURI,
		'foreignObject',
	);
	foreignObject.setAttributeNS(null, 'x', '0%');
	foreignObject.setAttributeNS(null, 'y', '0%');
	foreignObject.setAttributeNS(null, 'width', '100%');
	foreignObject.setAttributeNS(null, 'height', '100%');
	foreignObject.append(clone);
	svg.append(foreignObject);
	return svg;
}
