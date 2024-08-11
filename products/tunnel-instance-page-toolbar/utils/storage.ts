import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import memoize from 'memoize';

export const getPageToolbarSecretStorage = memoize(
	() => getTunnelInstancePageSecretStorage(),
	{ cacheKey: (_args) => 'tunnel' },
);
