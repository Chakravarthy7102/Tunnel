import * as serverAnalyticsDefinitions from '#events/_.ts';
import { getPosthog } from '#utils/posthog.ts';
import { APP_ENV } from '@-/env/app';
import { createNestedNamespace } from '@tunnel/namespace';
import onetime from 'onetime';

export const getServerAnalyticsNamespaces = onetime(
	() => {
		const posthog = getPosthog();
		return createNestedNamespace(serverAnalyticsDefinitions, {
			transformProperty({ property }) {
				if (APP_ENV === 'development') {
					return () => {
						/* noop */
					};
				} else {
					return function(this: any, ...args: any[]) {
						return property({ posthog }, ...args);
					};
				}
			},
		});
	},
);
