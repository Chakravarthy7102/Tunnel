import { createContext, useContext } from 'react';

export const ToolbarRootElementContext = createContext<HTMLDivElement | null>(
	null,
);

export function useShadowRoot(): ShadowRoot | Document {
	const toolbarRootElement = useContext(ToolbarRootElementContext);
	return toolbarRootElement?.getRootNode() as ShadowRoot | undefined ??
		(typeof document === 'undefined' ? ({} as ShadowRoot) : document);
}

export function useShadowRootElement(): HTMLElement {
	const shadowRoot = useShadowRoot();
	if (shadowRoot === document) {
		return document.body;
	}

	const rootNode: HTMLElement = shadowRoot.getRootNode() as any;
	const shadowRootElement = rootNode.querySelector('div') as HTMLElement;
	return shadowRootElement;
}

export function useToolbarElement(): HTMLElement | null {
	const shadowRootElement = useShadowRootElement();
	const toolbarElement = shadowRootElement.querySelector('#toolbar-container');

	if (!toolbarElement) {
		return null;
	}

	return toolbarElement as HTMLElement;
}
