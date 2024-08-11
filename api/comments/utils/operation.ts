// dprint-ignore
export function defineStateOperation<$Args>(): {
	client<$ClientReturn>(clientFunction: (args: $Args) => $ClientReturn): {
		server<$ServerReturn>(
			serverFunction: (args: $Args) => Promise<$ServerReturn>
		): {
			client(args: $Args): $ClientReturn;
			server(args: $Args): Promise<$ServerReturn>;
		};
	}
} {
	return {
		client: (clientFunction) => ({
			server: (serverFunction) => ({
				client(args) {
					return clientFunction(args);
				},
				async server(args) {
					clientFunction(args);
					return serverFunction(args);
				}
			})
		})
	}
}
