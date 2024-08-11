import __require from 'cjs-require';
import onetime from 'onetime';

export const getTemporaryStorageFolderPath = onetime(() => {
	if (typeof window === 'undefined') {
		const tmp = __require('./vendor/tmp.js') as typeof import('tmp');
		const { name: temporaryStorageFolderPath } = tmp.dirSync();
		return temporaryStorageFolderPath;
	} else {
		return '/tmp';
	}
});
