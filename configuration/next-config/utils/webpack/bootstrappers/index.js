const codeStubsBootstrapper = require('./code-stubs.js');
const esmImportsBootstrapper = require('./esm-imports.js');
const hmrFix = require('./hmr-fix.js');
const nodeImportsBootstrapper = require('./node-imports.js');
const serverExternalsBootstrapper = require('./server-externals.js');

/**
	We export an array to specify the order of the bootstrappers
*/
const bootstrappers = [
	codeStubsBootstrapper,
	esmImportsBootstrapper,
	hmrFix,
	nodeImportsBootstrapper,
	serverExternalsBootstrapper,
];

module.exports = bootstrappers;
