export function newTrace(nodeIdName: string, filename: string | null) {
	return {
		scope: nodeIdName,
		filename,
		events: [],
	};
}
