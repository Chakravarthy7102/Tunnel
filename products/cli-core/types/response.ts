export interface ResponseParser {
	/**

		@returns boolean whether or not the chunk we just added was the last chunk or not in the transfer-encoded: chunk stream
	*/
	isComplete(): boolean;

	/**

		@param chunk - The new chunk that is being added after onData

		@description Public facing function that gets called after onData and pushes the new node chunk into this class to process
	*/
	addChunk(chunk: Buffer): void;
}
