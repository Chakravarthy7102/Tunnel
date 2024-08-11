import { useContextEditPrompt } from '#hooks/context/edit-prompt.ts';
import { useGoToCode } from '#hooks/go-to-code.ts';
import type { PageToolbarContext } from '#types';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { getInstrumentationTrpc } from '#utils/trpc/instrumentation.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import type { HostEnvironmentType } from '@-/host-environment';
import { TNL__, tnlProperties } from '@-/instrumentation/tnl';
import { Banana, Code2 } from 'lucide-react';
import { outdent } from 'outdent';
import invariant from 'tiny-invariant';

export function GoToCodeButton({
	x,
	y,
	context,
}: {
	x: number;
	y: number;
	context: PageToolbarContext<{
		enabledExperimentalFeatures: {
			clickToCode: true;
		};
		hostnameType: 'local';
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
	}>;
}) {
	const { handleGoToCodeClick } = useGoToCode({ context });
	const { addEditMessage, addEditPromptFile } = useContextEditPrompt({
		context,
	});
	const state = useContextStore(context);

	return (
		<>
			<button
				onMouseDown={(event) => event.stopPropagation()}
				onClick={async () => {
					state.isCommandContextShowing = false;
					await handleGoToCodeClick({ x, y });
				}}
				className="flex flex-row justify-start items-center p-2 rounded-[5px] hover:bg-[#333] border border-solid border-transparent hover:border-[#444] gap-2 w-full text-sm transition-all"
			>
				<Code2 size={16} />
				Go to code
			</button>
			{isContext(context, state, { isOnline: true }) && (
				<button
					onMouseDown={(event) => event.stopPropagation()}
					onClick={async () => {
						state.isClickToCodeCursorVisible = false;
						const tunnelToolbarWrapper =
							document.querySelector<HTMLElement>('tunnel-toolbar') ??
								null;
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
								TNL__[tnlProperties.elementDomNodeToEventId].get(
									currentElement,
								) ??
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

								event = events.find((event) =>
									event.isOk() && event.value !== undefined
								)?.unwrapOr(undefined);
							}

							const { localProxyTrpc } = getLocalProxyTrpc({ context });
							if (event === undefined) {
								return;
							}

							// TODO: right now, there's a bug where the source is attached to the function call event instead of the render event
							if ('source' in event) {
								const fileContents = (await localProxyTrpc.file.read.query({
									filepath: event.source.fileName,
								})).unwrapOr('');

								const component =
									(await localProxyTrpc.file.getComponent.query({
										filePath: event.source.fileName,
										lineNumber: event.source.lineNumber,
										columnNumber: event.source.columnNumber - 1,
									})).unwrapOrThrow();

								addEditPromptFile({
									fileName: event.source.fileName,
									fileContents,
								});

								addEditMessage({
									role: 'system',
									input: outdent`
										Here is the full file context
										Filename: ${event.source.fileName}
										File Contents: ${fileContents.slice(0, 4096)}
									`,
								});

								addEditMessage({
									role: 'system',
									input: outdent`
										Here is the part the user clicked on and is interested in changing, we don't need to generate the entire file, only a replacement for this code
										Filename: ${event.source.fileName}
										Contents: ${component}
									`,
								});

								addEditMessage({
									role: 'assistant',
									input: outdent`
										How can I help you today?
									`,
								});
							}
						}

						context.store.setState({
							isCommandContextShowing: false,
							commandModePoint: null,
							isPromptDrawerOpen: true,
						});
					}}
					className="flex flex-row justify-start items-center p-2 rounded-[5px] hover:bg-[#333] border border-solid border-transparent hover:border-[#444] gap-2 w-full text-sm transition-all"
				>
					<Banana size={16} />
					Edit with AI
				</button>
			)}
		</>
	);
}
