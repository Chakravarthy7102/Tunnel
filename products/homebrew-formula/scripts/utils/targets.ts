import { getTunnelBinFilepath } from './filepath.ts';
import { getSha256Hash } from './hash.ts';

export async function getTargets() {
	return {
		'darwin-x64': {
			sha256Hash: await getSha256Hash('darwin-x64'),
			tunnelBinFilepath: getTunnelBinFilepath('darwin-x64'),
		},
		'darwin-arm64': {
			sha256Hash: await getSha256Hash('darwin-arm64'),
			tunnelBinFilepath: getTunnelBinFilepath('darwin-arm64'),
		},
		'linux-x64': {
			sha256Hash: await getSha256Hash('linux-x64'),
			tunnelBinFilepath: getTunnelBinFilepath('linux-x64'),
		},
		'linux-arm64': {
			sha256Hash: await getSha256Hash('linux-arm64'),
			tunnelBinFilepath: getTunnelBinFilepath('linux-arm64'),
		},
	};
}
