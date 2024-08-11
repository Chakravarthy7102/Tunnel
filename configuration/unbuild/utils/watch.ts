import { portToPid } from 'pid-port';

export async function isWatchMode() {
	try {
		return (await portToPid(53_099) !== undefined);
	} catch {
		return false;
	}
}
