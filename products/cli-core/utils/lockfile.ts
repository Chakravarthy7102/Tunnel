import os from 'node:os';
import path from 'pathe';

export const tunnelLockfilesDirpath = path.join(os.tmpdir(), 'tunnel');

export const getCurrentTunnelProcessLockfilePath = ({
	configFilePath,
}: {
	configFilePath: string;
}) => path.join(tunnelLockfilesDirpath, encodeURIComponent(configFilePath));
