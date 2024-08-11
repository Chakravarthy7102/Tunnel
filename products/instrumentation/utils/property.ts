export function createTnlProperty<T>(
	propertyKey: string,
	createValue: () => T,
): T {
	(globalThis as any).TNL__ ??= {};
	(globalThis as any).TNL__[propertyKey] ??= createValue();
	return (globalThis as any).TNL__[propertyKey];
}
