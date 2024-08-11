import type { PageToolbarContext } from '#types';
import { getInstrumentationTrpc } from '#utils/trpc/instrumentation.ts';
import type { HostEnvironmentType } from '@-/host-environment';
import { TNL__, tnlProperties } from '@-/instrumentation/tnl';
import invariant from 'tiny-invariant';

export function useGoToCode({
	context,
}: {
	context: PageToolbarContext<{
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
	}>;
}) {
	const handleGoToCodeClick = async ({ x, y }: { x: number; y: number }) => {
		context.store.setState({ isClickToCodeCursorVisible: false });
		const tunnelToolbarWrapper =
			document.querySelector<HTMLElement>('tunnel-toolbar') ?? null;
		invariant(
			tunnelToolbarWrapper !== null,
			'tunnel toolbar wrapper should not be null',
		);

		// For some reason, `document#elementFromPoint` returns the <html> element if we don't set pointer events of our tunnel pill to "none"
		tunnelToolbarWrapper.style.pointerEvents = 'none';
		const clickedElement = document.elementFromPoint(x, y);
		invariant(clickedElement, 'anchorElement is not undefined');
		tunnelToolbarWrapper.style.pointerEvents = 'auto';

		let currentElement: Element | null = clickedElement;
		let tnlEventId: string | null = null;
		while (currentElement !== null) {
			const elementTnlEventId =
				TNL__[tnlProperties.elementDomNodeToEventId].get(currentElement) ??
					// eslint-disable-next-line unicorn/prefer-dom-node-dataset -- todo
					currentElement.getAttribute('data-__tnl-event-id') ??
					undefined;

			if (elementTnlEventId !== undefined) {
				tnlEventId = elementTnlEventId;
				break;
			}

			currentElement = currentElement.parentElement;
		}

		if (tnlEventId !== null) {
			let event = TNL__[tnlProperties.getEvent](tnlEventId as any);

			if (event === undefined) {
				const { instrumentationTrpc } = getInstrumentationTrpc({
					context,
				});
				const events = await instrumentationTrpc.event.get.query({
					id: tnlEventId,
				});

				event = events.find((event) => event.unwrapOr(undefined) !== undefined)
					?.unwrapOr(undefined);
			}

			if (event === undefined) {
				return;
			}

			// TODO: right now, there's a bug where the source is attached to the function call event instead of the render event
			if ('source' in event) {
				const a = document.createElement('a');
				a.href =
					`vscode://file/${event.source.fileName}:${event.source.lineNumber}:${event.source.columnNumber}`;
				a.click();
			}
		}
	};

	return { handleGoToCodeClick };
}
