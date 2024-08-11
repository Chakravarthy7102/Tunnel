import { getTunnelGlobals } from '@-/tunneled-service-globals';

export function useLogs({
	shouldUploadLogs,
}: {
	shouldUploadLogs: boolean;
}) {
	const getNetworkLogEntries = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals || !shouldUploadLogs) {
			return null;
		}

		const { networkLogsHistory } = tunnelGlobals;
		return networkLogsHistory
			.map((log) => ({
				...log,
				requestBody:
					log.requestBody !== null && log.requestBody.length > 50_000 ?
						'[Request body too large]' :
						log.requestBody,
				responseBody:
					log.responseBody !== null && log.responseBody.length > 50_000 ?
						'[Response body too large]' :
						log.responseBody,
			}))
			.slice(-100)
			.sort((a, b) => a.startTime - b.startTime);
	};

	const getConsoleLogEntries = () => {
		const tunnelGlobals = getTunnelGlobals();
		if (!tunnelGlobals || !shouldUploadLogs) {
			return null;
		}

		const { consoleLogsHistory } = tunnelGlobals;

		// // Change based on how long ago we want logs from
		// const seconds = 30;
		// const timeInterval = Date.now() - seconds * 1000;

		// TODO: make it more clear to the user that a log has been filtered out for being too large
		return consoleLogsHistory
			.map((log) => {
				const payloadString = log.payload.join('');
				return {
					...log,
					payload: payloadString.length > 50_000 ?
						['[Log too large]'] :
						log.payload,
				};
			})
			.slice(-100)
			.sort((a, b) => a.timestamp - b.timestamp);
	};

	return {
		getConsoleLogEntries,
		getNetworkLogEntries,
	};
}
