import testRelativeFilepathsObject from '#tests/_.tests.js';
import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

export const testAbsoluteFilepaths = Object.keys(
	testRelativeFilepathsObject,
).map((testRelativeFilepath) =>
	path.join(
		packageDirpaths.monorepo,
		testRelativeFilepath.replace('/tests/', '/dist-tests/'),
	)
);
