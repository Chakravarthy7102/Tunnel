export function exprCallee(instrumentedCallee: unknown) {
	return instrumentedCallee;
}

export function propertyCallee(
	instrumentedObject: any,
	instrumentedProperty: any,
) {
	const callee = instrumentedObject[instrumentedProperty];
	return typeof callee === 'function' ?
		callee.bind(instrumentedObject) :
		callee;
}
