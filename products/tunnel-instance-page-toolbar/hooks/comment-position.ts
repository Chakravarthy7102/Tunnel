import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';
import { select } from '@-/client-doc';
import type { Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { RobulaPlus } from '@-/robula-plus';
import { getElementBySimiloXpath } from '@-/xpath';
import { useRef } from 'react';
import useForceUpdate from 'use-force-update';

export function useCommentThreadAbsolutePositions({
	context,
	isScrollAware,
}: {
	context: PageToolbarContext<{
		hasProject: true;
	}>;
	isScrollAware: boolean;
}) {
	const forceUpdate = useForceUpdate();
	const htmlElementsToWatch = useRef<
		Map<
			HTMLElement,
			{
				previousPosition: { x: number; y: number };
				commentThreadsIds: Set<string>;
			}
		>
	>(new Map());
	const cachedCommentThreadPositions = useRef<
		Map<string, { x: number; y: number } | null>
	>(new Map());
	const windowDimensions = useRef<{ height: number; width: number }>({
		height: window.innerHeight,
		width: window.innerWidth,
	});

	function getCommentThreadAbsolutePosition({
		commentThreadId,
	}: {
		commentThreadId: Id<'ProjectCommentThread'>;
	}): {
		x: number;
		y: number;
	} | null {
		// We cache the comment thread positions because computing Similo XPaths is somewhat expensive
		const cachedCommentThreadPosition = cachedCommentThreadPositions.current
			.get(commentThreadId);
		if (cachedCommentThreadPosition !== undefined) {
			return cachedCommentThreadPosition;
		}

		const commentThread = select(
			context.store.getState(),
			'ProjectCommentThread',
			commentThreadId,
			getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
		);
		const { anchorElementXpath, percentageLeft, percentageTop, xpathType } =
			commentThread;

		if (anchorElementXpath === null) {
			return null;
		}

		let element: HTMLElement | null;
		if (xpathType !== 'similo') {
			const robula = new RobulaPlus();
			element = robula.getElementByXPath(anchorElementXpath, document);
		} else {
			element = getElementBySimiloXpath(
				anchorElementXpath,
				document,
			);
		}

		if (element === null) {
			return null;
		}

		const rect = element.getBoundingClientRect();
		const pos = isScrollAware ?
			getAbsolutePosition(element) :
			rect;

		const x = (percentageLeft / 100) * rect.width + pos.x;
		const y = (percentageTop / 100) * rect.height + pos.y;

		const absolutePosition = { x, y };

		if (!htmlElementsToWatch.current.has(element)) {
			htmlElementsToWatch.current.set(element, {
				commentThreadsIds: new Set(),
				previousPosition: absolutePosition,
			});
		}

		htmlElementsToWatch.current
			.get(element)
			?.commentThreadsIds.add(commentThreadId);

		cachedCommentThreadPositions.current.set(commentThreadId, absolutePosition);

		return absolutePosition;
	}

	/**
		@see https://stackoverflow.com/a/42543908/12581865
	*/
	function getScrollParent(node: any): HTMLElement | null {
		const isElement = node instanceof HTMLElement;
		const overflowY = isElement && window.getComputedStyle(node).overflowY;
		const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';

		if (!node) {
			return null;
		} else if (isScrollable && node.scrollHeight >= node.clientHeight) {
			return node;
		}

		return getScrollParent(node.parentNode) ?? document.body;
	}

	function getOffsetParents(element: HTMLElement): HTMLElement[] {
		const offsetParents = [];
		let currentElement: HTMLElement | null = element;

		while (currentElement !== null) {
			offsetParents.push(currentElement);
			if (window.getComputedStyle(currentElement).position === 'fixed') {
				return offsetParents;
			}

			currentElement = currentElement.offsetParent as HTMLElement | null;
		}

		return offsetParents;
	}

	function getScrollParents(element: HTMLElement): HTMLElement[] {
		const scrollParents = [];
		let currentElement: HTMLElement | null = element;

		do {
			if (getScrollParent(currentElement) === currentElement) {
				scrollParents.push(currentElement);
			}

			currentElement = getScrollParent(currentElement.parentElement);
		} while (currentElement !== null && currentElement !== document.body);

		return scrollParents;
	}

	function getAbsolutePosition(element: HTMLElement) {
		let x = 0;
		let y = 0;
		const offsetParents = getOffsetParents(element);
		const scrollParents = getScrollParents(element);

		for (const offsetParent of offsetParents) {
			x += offsetParent.offsetLeft + offsetParent.clientLeft;
			y += offsetParent.offsetTop + offsetParent.clientTop;
		}

		for (const scrollParent of scrollParents) {
			x -= scrollParent.scrollLeft;
			y -= scrollParent.scrollTop;
		}

		if (offsetParents.at(-1) !== document.body) {
			x += window.scrollX;
			y += window.scrollY;
		}

		return { x, y };
	}

	useOnceEffect(() => {
		function haveElementsMoved() {
			// If the window was resized, then we assume that the elements have moved
			if (
				window.innerHeight !== windowDimensions.current.height ||
				window.innerWidth !== windowDimensions.current.width
			) {
				windowDimensions.current = {
					height: window.innerHeight,
					width: window.innerWidth,
				};

				// We also clear the cached comment positions when the window is resized
				cachedCommentThreadPositions.current.clear();

				return true;
			}

			for (
				const [
					htmlElement,
					{ commentThreadsIds, previousPosition },
				] of htmlElementsToWatch.current.entries()
			) {
				const currentPosition = getAbsolutePosition(htmlElement);

				for (const commentThreadId of commentThreadsIds) {
					const commentThread = select(
						context.store.getState(),
						'ProjectCommentThread',
						commentThreadId,
						getInclude(ProjectCommentThread_$tunnelInstancePageToolbarData),
					);

					if (
						commentThread === null ||
						commentThread.route !== window.location.pathname
					) {
						continue;
					}

					if (isScrollAware) {
						if (
							currentPosition.x !== previousPosition.x ||
							currentPosition.y !== previousPosition.y
						) {
							return true;
						}
					} else {
						if (
							htmlElement.offsetLeft !== previousPosition.x ||
							htmlElement.offsetTop !== previousPosition.y
						) {
							return true;
						}
					}
				}
			}

			return false;
		}

		function loopCheckElements() {
			if (haveElementsMoved()) {
				for (const htmlElement of htmlElementsToWatch.current.keys()) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know it's defined
					htmlElementsToWatch.current.get(htmlElement)!.previousPosition =
						getAbsolutePosition(
							htmlElement,
						);
				}

				forceUpdate();
			}

			const animationFrameId = requestAnimationFrame(loopCheckElements);
			return () => {
				cancelAnimationFrame(animationFrameId);
			};
		}

		return loopCheckElements();
	});

	return {
		getCommentThreadAbsolutePosition,
	};
}
