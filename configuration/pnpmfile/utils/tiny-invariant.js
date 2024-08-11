/**
	Copied from https://github.com/alexreardon/tiny-invariant/blob/master/tiny-invariant.ts
*/

// Never use production for pnpmfile
const isProduction = false;
const prefix = 'Invariant failed';

/**
	@param {any} condition
	@param {string | (() => string)} message
	@returns {asserts condition}
*/
module.exports = function invariant(condition, message) {
	if (condition) {
		return;
	}

	if (isProduction) {
		throw new Error(prefix);
	}

	const provided = typeof message === 'function' ? message() : message;

	const value = provided ? `${prefix}: ${provided}` : prefix;

	throw new Error(value);
};
