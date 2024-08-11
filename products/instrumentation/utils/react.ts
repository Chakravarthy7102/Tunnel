import { createTnlProperty } from './property.ts';
import { tnlProperties } from './tnl-aliases.ts';

/**
	The set of references to the `jsxDEV` function used by React to render components.
*/
export const jsxDEVFunctions = createTnlProperty(
	tnlProperties.jsxDEVFunctions,
	() => new WeakSet<Function>(),
);
