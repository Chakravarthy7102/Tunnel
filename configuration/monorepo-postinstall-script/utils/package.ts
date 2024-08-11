import { getPackageDirpath, packageNames } from '@-/packages-config';
import fs from 'node:fs';
import onetime from 'onetime';

export const getExistingPackageNames = onetime(() =>
	Object.values(packageNames).filter((packageName) =>
		fs.existsSync(getPackageDirpath({ packageName }))
	)
);
