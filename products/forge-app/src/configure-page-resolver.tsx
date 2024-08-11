import * as api from '@forge/api';
import Resolver from '@forge/resolver';

const resolver = new (Resolver as any)();

resolver.define('getWebTriggerUrl', async () => {
	const webTriggerUrl = await api.webTrigger.getUrl('webtrigger');
	return webTriggerUrl;
});

export const handler = resolver.getDefinitions();
