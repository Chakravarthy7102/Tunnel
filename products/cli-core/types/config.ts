export interface TunnelConfig {
	app: {
		id: string;
		slug: string;
	};

	/**
		The port that the application listens to
	*/
	port: number;
}
