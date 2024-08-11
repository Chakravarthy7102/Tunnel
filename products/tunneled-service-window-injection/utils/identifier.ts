import { outdent } from 'outdent';

const windowAliases = new Set([
	'window',
	'self',
	'parent',
	'top',
	'frames',
	'this',
]);

export function getIdentifierReplacement(identifier: string) {
	let identifierReplacement: string;
	if (windowAliases.has(identifier)) {
		/**
			We need to account for the identifier possibly referencing a local variable.

			Previous attempts:

			-> (identifier === __tunnel__.originalWindow ? __tunnel__.window : identifier)
			This doesn't work because of automatic semicolon insertion.

			-> __tunnel__.ensureWindowProxy(...)
			This doesn't work because of operator precedence with `new`
		*/
		identifierReplacement = outdent`
			__tunnel__.ensureWindowProxy[__tunnel__.ensureWindowProxy[0] = ${identifier} === __tunnel__.originalWindow ? __tunnel__.window : ${identifier}, 0]
		`;
	} else if (identifier === 'location') {
		// We need to account for `location` possibly being a local variable
		identifierReplacement = outdent`
			__tunnel__.ensureLocationProxy[__tunnel__.ensureLocationProxy[0] = ${identifier} === __tunnel__.originalWindow.location ? __tunnel__.window.location : ${identifier}, 0]
		`;
	} else {
		identifierReplacement = identifier;
	}

	return identifierReplacement;
}
