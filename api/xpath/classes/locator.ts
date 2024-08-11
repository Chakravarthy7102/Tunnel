export class Locator {
	private metadata: { [key: string]: string } = {};

	constructor(private element: Element) {}

	public putMetadata(key: string, value: string): void {
		this.metadata[key] = value;
	}

	public getMetadata(key: string): string | undefined {
		return this.metadata[key];
	}
}
