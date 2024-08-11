/**
	Our `.pnpmfile.cjs` logic is housed in `./configuration/pnpmfile` so that we can take advantage of tooling like ESLint and TypeScript intellisense.
*/

module.exports = require('./configuration/pnpmfile/exports/main.js');
