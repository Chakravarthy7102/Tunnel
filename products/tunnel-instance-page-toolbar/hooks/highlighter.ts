import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/_.ts';
import {
	canvasToFile,
	drawToCanvas,
	getCroppedScreenshot,
} from '#utils/screenshot.ts';
import { select } from '@-/client-doc';
import { getSimiloXpathForElement } from '@-/xpath';
import { useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import invariant from 'tiny-invariant';

export function useHighlighter(
	{ context }: { context: PageToolbarContext },
) {
	const state = useContextStore(context);
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const dragOverlayRef = useRef<HTMLDivElement | null>(null);
	const tagRef = useRef<HTMLDivElement | null>(null);
	const elementRef = useRef<HTMLElement | null>(null);
	const isMouseDownRef = useRef(false);
	const startPositionRef = useRef({ x: 0, y: 0 });

	const x = useTransform(context.mousePositionMotionValue, ({ x }) => x);
	const y = useTransform(context.mousePositionMotionValue, ({ y }) => y);

	// Initialize the overlay once
	if (!overlayRef.current) {
		const overlay = document.createElement('div');
		overlay.style.position = 'absolute';
		overlay.style.border = '2px dashed #375DFB';
		overlay.style.background = '#375DFB10';
		overlay.style.zIndex = '500';
		overlay.style.display = 'none';
		overlay.id = 'tunnel-overlay-regular';
		document.body.append(overlay);
		overlayRef.current = overlay;

		// Create and style the tag for displaying the tagName, ensuring it's always positioned relative to the overlay
		const tag = document.createElement('div');
		tag.style.position = 'absolute';
		tag.style.top = '0';
		tag.style.right = '0';
		tag.style.background = '#375DFB';
		tag.style.color = 'white';
		tag.style.padding = '3px 6px';
		tag.style.fontSize = '12px';
		tag.style.fontWeight = 'bold';
		tag.textContent = elementRef.current ? elementRef.current.tagName : '';
		overlay.append(tag);
		tagRef.current = tag;
	}

	if (!dragOverlayRef.current) {
		const dragOverlay = document.createElement('div');
		dragOverlay.id = 'drag-overlay';
		dragOverlay.style.position = 'absolute';
		dragOverlay.style.border = '2px dashed #375DFB';
		dragOverlay.style.background = '#375DFB10';
		dragOverlay.style.zIndex = '500';
		dragOverlay.style.display = 'none';
		dragOverlay.style.pointerEvents = 'none';
		dragOverlay.id = 'tunnel-overlay-drag';
		document.body.append(dragOverlay);
		dragOverlayRef.current = dragOverlay;
	}

	function onStopScreenshot({
		removeCursor,
	}: {
		removeCursor: boolean;
	}) {
		if (!dragOverlayRef.current) return;

		if (removeCursor) {
			context.store.setState({
				isCommentCursorVisible: false,
				isToolbarHidden: false,
			});
		}

		// document.body.style.overflow = '';
		document.body.style.userSelect = '';
		isMouseDownRef.current = false;
		dragOverlayRef.current.style.border = '2px dashed #375DFB';
		dragOverlayRef.current.style.background = '#375DFB10';
		document.body.style.pointerEvents = 'auto';
	}

	useEffect(() => {
		if (state.isCommentCursorVisible && !state.commentBoxPosition) {
			document.body.style.cursor = 'none';
			// document.body.style.overflow = 'hidden';
		} else {
			if (document.body.getAttribute('style') === 'cursor: none;') {
				document.body.removeAttribute('style');
			} else if (document.body.style.cursor === 'none') {
				document.body.style.cursor = 'auto';
				// document.body.style.overflow = 'auto';
			}
		}
	}, [state.isCommentCursorVisible]);

	useEffect(() => {
		if (
			!state.isCommentCursorVisible &&
			overlayRef.current && dragOverlayRef.current
		) {
			overlayRef.current.style.display = 'none';
			dragOverlayRef.current.style.display = 'none';
		}
	}, [
		state.isCommentCursorVisible,
	]);

	useEffect(() => {
		const updateOverlay = (element: HTMLElement) => {
			if (overlayRef.current && tagRef.current) {
				const rect = element.getBoundingClientRect();
				overlayRef.current.style.top = `${window.scrollY + rect.top}px`;
				overlayRef.current.style.left = `${window.scrollX + rect.left}px`;
				overlayRef.current.style.width = `${rect.width}px`;
				overlayRef.current.style.height = `${rect.height}px`;
				overlayRef.current.style.display = 'block';
				overlayRef.current.style.pointerEvents = 'none';

				tagRef.current.textContent =
					elementRef.current?.tagName.toLowerCase() ?? '';
			}
		};

		const onMouseMove = (e: MouseEvent) => {
			const {
				isCommentCursorVisible,
				commentBoxPosition,
			} = context.store.getState();

			// means that a comment is currently being left
			if (
				commentBoxPosition !== null ||
				overlayRef.current === null ||
				dragOverlayRef.current === null || !isCommentCursorVisible
			) return;

			if (!isMouseDownRef.current) {
				const tunnelToolbarWrapper =
					document.querySelector<HTMLElement>('tunnel-toolbar') ?? null;
				invariant(
					tunnelToolbarWrapper !== null,
					'tunnel toolbar wrapper should not be null',
				);

				// For some reason, `document#elementFromPoint` returns the <html> element if we don't set pointer events of our tunnel pill to "none"
				tunnelToolbarWrapper.style.pointerEvents = 'none';

				const elements = document.elementsFromPoint(
					context.mousePositionMotionValue.get().x - 1,
					context.mousePositionMotionValue.get().y - 1,
				);

				// if the element is not the current element, update the overlay
				// otherwise set the element to null and the display of the overlay to none
				for (const el of elements) {
					if (el !== overlayRef.current) {
						const currentElement = el as HTMLElement;

						updateOverlay(currentElement);
						elementRef.current = currentElement;

						break;
					}
				}

				tunnelToolbarWrapper.style.pointerEvents = 'auto';
			} else {
				overlayRef.current.style.display = 'none';

				const offsetX = e.clientX - startPositionRef.current.x;
				const offsetY = e.clientY - startPositionRef.current.y;

				// Get document dimensions
				const documentWidth = document.documentElement.scrollWidth;
				const documentHeight = document.documentElement.scrollHeight;

				// Ensure the mouse position is within the document
				const clientX = Math.min(Math.max(e.clientX, 0), documentWidth);
				const clientY = Math.min(Math.max(e.clientY, 0), documentHeight);

				// Adjust for scroll
				const { scrollX, scrollY } = window;

				if (offsetX < 0) {
					dragOverlayRef.current.style.left = `${clientX + scrollX}px`;
				} else {
					dragOverlayRef.current.style.left = `${
						startPositionRef.current.x + scrollX
					}px`;
				}

				if (offsetY < 0) {
					dragOverlayRef.current.style.top = `${clientY + scrollY}px`;
				} else {
					dragOverlayRef.current.style.top = `${
						startPositionRef.current.y + scrollY
					}px`;
				}

				dragOverlayRef.current.style.width = `${
					Math.abs(
						clientX - startPositionRef.current.x,
					)
				}px`;
				dragOverlayRef.current.style.height = `${
					Math.abs(
						clientY - startPositionRef.current.y,
					)
				}px`;
			}
		};

		const onScroll = () => {
			const {
				isCommentCursorVisible,
				commentBoxPosition,
			} = context.store.getState();

			if (
				commentBoxPosition !== null ||
				overlayRef.current === null ||
				dragOverlayRef.current === null || !isCommentCursorVisible
			) return;

			if (elementRef.current) {
				updateOverlay(elementRef.current);
			}
		};

		const onMouseDown = (e: MouseEvent) => {
			const {
				isCommentCursorVisible,
				commentBoxPosition,
			} = context.store.getState();

			// means that a comment is currently being left
			if (
				commentBoxPosition !== null ||
				overlayRef.current === null ||
				dragOverlayRef.current === null || !isCommentCursorVisible
			) return;
			// document.body.style.pointerEvents = 'none';
			isMouseDownRef.current = true;
			startPositionRef.current = { x: e.clientX, y: e.clientY };

			dragOverlayRef.current.style.left = `${e.clientX}px`;
			dragOverlayRef.current.style.top = `${e.clientY}px`;
			dragOverlayRef.current.style.width = '0px';
			dragOverlayRef.current.style.height = '0px';
			dragOverlayRef.current.style.display = 'block';

			// Disable pointer events and prevent scrolling and text selection
			// document.body.style.overflow = 'hidden';
			document.body.style.userSelect = 'none';
		};

		const onMouseUp = async () => {
			const state = context.store.getState();
			const {
				isCommentCursorVisible,
				commentBoxPosition,
				projectId,
			} = state;
			const project = select(state, 'Project', projectId);

			// means that a comment is currently being left
			if (
				commentBoxPosition !== null ||
				overlayRef.current === null ||
				dragOverlayRef.current === null || !isCommentCursorVisible
			) return;

			isMouseDownRef.current = false;

			if (
				dragOverlayRef.current.offsetHeight < 8 &&
				dragOverlayRef.current.offsetWidth < 8
			) {
				// Not a screenshot comment
				onStopScreenshot({ removeCursor: false });

				const tunnelToolbarWrapper =
					document.querySelector<HTMLElement>('tunnel-toolbar') ?? null;
				invariant(
					tunnelToolbarWrapper !== null,
					'tunnel toolbar wrapper should not be null',
				);

				// For some reason, `document#elementFromPoint` returns the <html> element if we don't set pointer events of our tunnel pill to "none"
				tunnelToolbarWrapper.style.pointerEvents = 'none';
				const anchorElement = document.elementFromPoint(x.get(), y.get());
				invariant(anchorElement, 'anchorElement is not undefined');
				tunnelToolbarWrapper.style.pointerEvents = 'auto';

				if (
					// anchorElementXpath === null || !(anchorElement instanceof HTMLElement)
					!(anchorElement instanceof HTMLElement)
				) {
					// TODO: display a toast to the user saying that there's something wrong with the element and it can't be located
					return;
				}

				const anchorElementXpath = getSimiloXpathForElement(
					anchorElement,
					document,
				);

				const rect = anchorElement.getBoundingClientRect();
				const percentageLeft = ((x.get() - rect.x) / rect.width) * 100;
				const percentageTop = ((y.get() - rect.y) / rect.height) * 100;

				const croppedScreenshotFilePromise =
					project !== null && project.isAutoScreenshotEnabled ?
						getCroppedScreenshot(anchorElement)
							.then(async (croppedScreenshotCanvas) => {
								if (!croppedScreenshotCanvas) {
									return null;
								}

								return canvasToFile(croppedScreenshotCanvas, 'screenshot');
							}) :
						null;

				context.store.setState({
					pendingNewCommentThread: {
						route: window.location.pathname,
						anchorElementXpath,
						xpathType: 'similo',
						percentageLeft,
						percentageTop,
						content: [],
						fileUploads: [],
						files: [],
						screenshot: croppedScreenshotFilePromise,
					},
					commentBoxPosition: {
						x: x.get(),
						y: y.get(),
					},
				});

				document.body.style.cursor = 'default';
			} else {
				document.body.style.userSelect = '';
				isMouseDownRef.current = false;

				try {
					dragOverlayRef.current.style.border = 'transparent';
					dragOverlayRef.current.style.background = 'transparent';
					context.store.setState({ isToolbarHidden: true });

					const stream = await navigator.mediaDevices.getDisplayMedia({
						video: true,
						// @ts-expect-error
						preferCurrentTab: true,
					});

					const [track] = stream.getVideoTracks();

					if (!track) {
						return;
					}

					const canvas = await drawToCanvas(
						stream,
						dragOverlayRef.current,
						false,
					);
					const file = await canvasToFile(canvas, 'image.png');

					const canvas2 = await drawToCanvas(
						stream,
						dragOverlayRef.current,
						true,
					);
					const file2 = await canvasToFile(canvas2, 'image2.png');

					onStopScreenshot({
						removeCursor: true,
					});

					track.stop();

					const tunnelToolbarWrapper =
						document.querySelector<HTMLElement>('tunnel-toolbar') ?? null;
					invariant(
						tunnelToolbarWrapper !== null,
						'tunnel toolbar wrapper should not be null',
					);

					// Calculate the middle point of overlayRef.current
					const overlayMiddlePoint = {
						x: dragOverlayRef.current.offsetLeft +
							dragOverlayRef.current.offsetWidth / 2,
						y: dragOverlayRef.current.offsetTop +
							dragOverlayRef.current.offsetHeight / 2,
					};

					// For some reason, `document#elementFromPoint` returns the <html> element if we don't set pointer events of our tunnel pill to "none"
					tunnelToolbarWrapper.style.pointerEvents = 'none';

					const anchorElement = document.elementFromPoint(
						overlayMiddlePoint.x - window.scrollX,
						overlayMiddlePoint.y - window.scrollY,
					);

					if (anchorElement === null) {
						// TODO: display a toast to the user saying that the element disappeared
						return;
					}

					tunnelToolbarWrapper.style.pointerEvents = 'auto';

					const anchorElementXpath = getSimiloXpathForElement(
						anchorElement,
						document,
					);

					const { x, y, width, height } = anchorElement.getBoundingClientRect();
					const percentageLeft = ((overlayMiddlePoint.x - x) / width) * 100;
					const percentageTop = ((overlayMiddlePoint.y - y) / height) * 100;

					dragOverlayRef.current.style.border = '2px dashed #375DFB';
					dragOverlayRef.current.style.background = '#375DFB10';

					context.store.setState({
						dialogNewCommentThread: {
							route: window.location.pathname,
							anchorElementXpath,
							xpathType: 'similo',
							percentageLeft,
							percentageTop,
							rawText: '',
							fileUploads: [],
							screenshot: [file, file2],
							session: {
								events: [],
								thumbnail: null,
							},
						},
					});
				} catch {
					onStopScreenshot({
						removeCursor: true,
					});
				}
			}
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, []);
}
