import { Toolbar } from '#components/toolbar.tsx';
import * as contextPropertyCreators from '#context/properties/_.ts';
import type { PageToolbarContext, PageToolbarState } from '#types';
import { WithContext } from '#utils/context/with-context.tsx';
import { ToolbarRootElementContext } from '#utils/shadow-root.ts';
import { ConvexProviderWithAuth, ConvexReactClient } from '@-/convex/react';
import type { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { toast } from '@-/tunnel-error';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import {
	createTunnelGlobalsObject,
	getTunnelGlobals,
} from '@-/tunneled-service-globals';
import chalk from 'chalk';
import { deepmerge } from 'deepmerge-ts';
import onetime from 'onetime';
import { outdent } from 'outdent';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { createStore } from 'zustand/vanilla';
import { getUseWorkosAuth } from './auth.tsx';
import { isTunnelToolbarMounted, mountTunnelToolbar } from './mount.ts';
import {
	getTunnelInstancePageToolbarCssUrl,
	getTunnelInstancePageToolbarGlobalCssUrl,
} from './url.ts';

/**
	This function should only be called once per page load.
*/
export function initializeTunnelToolbar() {
	const tunneledServiceEnvironmentData = (globalThis as any)
		.__TUNNELED_SERVICE_ENVIRONMENT_DATA__ as TunneledServiceEnvironmentData<
			HostEnvironmentType
		>;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Should never be undefined, but useful during debugging
	if (tunneledServiceEnvironmentData === undefined) {
		throw new Error('`__TUNNELED_SERVICE_ENVIRONMENT_DATA__` is missing');
	}

	let context: PageToolbarContext | undefined;

	// The injection might not have been loaded (e.g. when using the <script> tag), so we set the __tunnel__ global object if it hasn't been set
	if (!('__tunnel__' in window)) {
		Object.defineProperty(window, '__tunnel__', {
			// We freeze our internal object for security reasons (to prevent malicious users with tampering with these properties)
			writable: false,
			enumerable: false,
			configurable: false,
			value: createTunnelGlobalsObject({
				tunneledServiceEnvironmentData,
			}),
		});
	} else {
		// Might be null if loaded from the <script> tag
		// @ts-expect-error: custom property
		if (window.__tunnel__.tunneledServiceEnvironmentData === null) {
			// @ts-expect-error: custom property
			window.__tunnel__.tunneledServiceEnvironmentData =
				tunneledServiceEnvironmentData;
		}
	}

	/**
		Note that this function doesn't assign any state to $collections because it might be incomplete from the `__TUNNELED_SERVICE_ENVIRONMENT_DATA__` result
	*/
	(globalThis as any).__tunnel__.getContext = () => {
		if (context !== undefined) {
			return context;
		}

		const withPendingActions =
			(config: any) => (set: any, get: any, api: any) =>
				config(
					(...args: any[]) => {
						set(...args);
						for (const { pendingAction } of get().$pendingActions) {
							set(pendingAction);
						}
					},
					get,
					api,
				);

		const store = createStore<PageToolbarState>(withPendingActions(() => ({
			...(deepmerge(
				...Object.values(contextPropertyCreators).map((createProperties: any) =>
					createProperties({ tunneledServiceEnvironmentData })
				),
			) as any),
		})));

		context = {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Does not exist at runtime
			__args__: null!,
			store,
			hostEnvironment: tunneledServiceEnvironmentData.hostEnvironment,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Will be initialized later
			mousePositionMotionValue: null!,
		} as PageToolbarContext;

		return context;
	};

	if (localStorage.getItem('tunnel:hideWelcome') === null) {
		logger.write(outdent({ trimLeadingNewline: false })`
			████████╗██╗   ██╗███╗   ██╗███╗   ██╗███████╗██╗
			╚══██╔══╝██║   ██║████╗  ██║████╗  ██║██╔════╝██║
			   ██║   ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║
			   ██║   ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║
			   ██║   ╚██████╔╝██║ ╚████║██║ ╚████║███████╗███████╗
			   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝

			Join our Discord: https://discord.gg/zMw6ZF2qCf

			${
			chalk.italic.dim(
				'(to hide this message, run `__tunnel__.hideWelcome()` in this console)',
			)
		}
	`);
	}

	// We need to call `root.render(...)` once for the entire page's lifetime to prevent double-renders when the toolbar is removed and re-added to the DOM
	const getTunnelToolbarRootElement = onetime(() => {
		const rootElement = document.createElement('div');
		rootElement.style.all = 'revert';
		rootElement.style.zIndex = '99999';
		rootElement.style.display = 'block';

		const convexUrl = process.env.CONVEX_URL;
		if (convexUrl === undefined) {
			throw new Error('CONVEX_URL not found in environment');
		}

		const convex = new ConvexReactClient(convexUrl);

		const root = createRoot(rootElement);
		const ToolbarWithContext = WithContext({
			tunneledServiceEnvironmentData,
		})(Toolbar);
		const tunnelGlobals = getTunnelGlobals();

		if (!tunnelGlobals) {
			throw new Error('Could not find the global `__tunnel__` variable');
		}

		const { getContext } = tunnelGlobals;
		const context = getContext?.();

		if (context === undefined) {
			throw new Error(
				'The toolbar has not yet set the context on the global tunnel object',
			);
		}

		const useWorkosAuth = getUseWorkosAuth({ context });

		root.render(
			<ErrorBoundary
				fallback={null}
				onError={(error) => {
					logger.error(error);
					toast.error(error.message);
				}}
			>
				<ToolbarRootElementContext.Provider value={rootElement}>
					<ConvexProviderWithAuth
						client={convex}
						useAuth={useWorkosAuth}
					>
						<ToolbarWithContext />
					</ConvexProviderWithAuth>
				</ToolbarRootElementContext.Provider>
			</ErrorBoundary>,
		);

		return { rootElement };
	});

	class TunnelToolbar extends HTMLElement {
		toolbarStylesheetLink?: HTMLLinkElement;
		toolbarGlobalStylesheetLink?: HTMLLinkElement;
		fontsGoogleapisPreconnectLink?: HTMLLinkElement;
		fontsGstaticPreconnectLink?: HTMLLinkElement;
		googleFontLink?: HTMLLinkElement;

		connectedCallback() {
			const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: 'open' });

			const toolbarStylesheetLink = document.createElement('link');
			toolbarStylesheetLink.rel = 'stylesheet';
			toolbarStylesheetLink.href = getTunnelInstancePageToolbarCssUrl({
				tunneledServiceEnvironmentData,
			});

			const toolbarGlobalStylesheetLink = document.createElement('link');
			toolbarGlobalStylesheetLink.rel = 'stylesheet';
			toolbarGlobalStylesheetLink.href =
				getTunnelInstancePageToolbarGlobalCssUrl({
					tunneledServiceEnvironmentData,
				});

			// Google Fonts
			const fontsGoogleapisPreconnectLink = document.createElement('link');
			fontsGoogleapisPreconnectLink.rel = 'preconnect';
			fontsGoogleapisPreconnectLink.href = 'https://fonts.googleapis.com';
			const fontsGstaticPreconnectLink = document.createElement('link');
			fontsGstaticPreconnectLink.rel = 'preconnect';
			fontsGstaticPreconnectLink.crossOrigin = 'crossorigin';
			fontsGstaticPreconnectLink.href = 'https://fonts.gstatic.com';
			const googleFontLink = document.createElement('link');
			googleFontLink.rel = 'stylesheet';
			googleFontLink.href =
				'https://fonts.googleapis.com/css2?family=Inter&display=swap';

			const stylesheetsLoadedPromise = Promise.all([
				toolbarStylesheetLink,
				toolbarGlobalStylesheetLink,
				googleFontLink,
			].map(async (link) =>
				new Promise((resolve, reject) => {
					link.addEventListener('load', resolve);
					link.addEventListener('error', reject);
				})
			));

			document.head.append(toolbarGlobalStylesheetLink);
			shadowRoot.append(
				toolbarStylesheetLink,
				fontsGoogleapisPreconnectLink,
				fontsGstaticPreconnectLink,
				googleFontLink,
			);

			const { rootElement } = getTunnelToolbarRootElement();

			setTimeout(() => {
				rootElement.style.display = 'block';
				shadowRoot.append(rootElement);
				rootElement.style.opacity = '0';

				void stylesheetsLoadedPromise.finally(() => {
					rootElement.style.opacity = '1';
				});
			}, 0);

			/**
				The browser doesn't load fonts when it's only specified in a Web component's Shadow DOM.

				@see https://stackoverflow.com/a/57623658
			*/
			document.head.append(
				fontsGoogleapisPreconnectLink,
				fontsGoogleapisPreconnectLink,
				googleFontLink,
			);
		}

		disconnectedCallback() {
			// We "cache" the element by attaching it to the body and making it invisible
			const { rootElement } = getTunnelToolbarRootElement();
			document.body.insertBefore(rootElement, null);
			rootElement.style.display = 'none';

			this.toolbarStylesheetLink?.remove();
			this.toolbarGlobalStylesheetLink?.remove();
			this.fontsGoogleapisPreconnectLink?.remove();
			this.fontsGstaticPreconnectLink?.remove();
			this.googleFontLink?.remove();
		}
	}

	if (customElements.get('tunnel-toolbar') === undefined) {
		customElements.define('tunnel-toolbar', TunnelToolbar);
	}

	if (!isTunnelToolbarMounted()) {
		// Only mount the tunnel toolbar when the document is ready
		if (/complete|interactive|loaded/.test(document.readyState)) {
			mountTunnelToolbar();
		} else {
			document.addEventListener('DOMContentLoaded', mountTunnelToolbar);
		}
	}
}
