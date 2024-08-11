import enquirer from 'enquirer';

export async function promptLocalServicePort(): Promise<number> {
	let clientPort: number | undefined;

	while (clientPort === undefined) {
		// If the ports weren't specified, prompt the user to enter the ports
		const { clientPortString } =
			// eslint-disable-next-line no-await-in-loop -- we want to wait until the user enters a value
			await enquirer.prompt<{ clientPortString: string }>({
				name: 'clientPortString',
				type: 'input',
				message: 'App Port:',
				required: true,
			});

		clientPort = Number(clientPortString);
	}

	return clientPort;
}
