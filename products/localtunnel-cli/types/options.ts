export interface TunnelClusterOptions {
	remote_ip: string;
	remote_host: string;
	remote_port: number;
	local_host: string;
	local_port: number;
	local_https: boolean;
	allow_invalid_cert: boolean;
	local_cert: string;
	local_key: string;
	local_ca: string;
}

export interface TunnelOptions {
	host: string;
	subdomain: string;
	port: number;
	local_host: string;
	local_https: boolean;
	local_cert: string;
	local_key: string;
	local_ca: string;
	allow_invalid_cert: boolean;
}
