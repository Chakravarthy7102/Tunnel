import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

export const fixturesDirpath = path.join(
	packageDirpaths.playwrightTests,
	'fixtures',
);
