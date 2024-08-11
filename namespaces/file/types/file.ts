export type ParsedFile<T> = {
	rawContents: null;
	parsedContents: null;
	isLoading: true;
} | {
	rawContents: string;
	parsedContents: T;
	isLoading: false;
} | {
	rawContents: null;
	parsedContents: null;
	isLoading: false;
};
