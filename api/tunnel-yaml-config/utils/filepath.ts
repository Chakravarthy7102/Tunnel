import path from 'pathe';

export function getLocalProjectTunnelYamlConfigFilepath({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}): string {
	return path.join(localProjectRootDirpath, 'tunnel.yaml');
}
