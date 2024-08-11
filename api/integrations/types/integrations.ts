import type integrationPackages from '#integrations/_.packages.ts';
import { expectTypeOf } from 'expect-type';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- Just used for type verification
import { dependencies } from '../package.json';

type IntegrationPackagesNames = `@-/${keyof typeof integrationPackages extends
	`integrations/${infer $PackageName}/package.json` ? $PackageName : never}`;

// This type validates that all of the integration packages have been added to the `package.json` file of `@-/integrations`
expectTypeOf(dependencies).toMatchTypeOf<
	{ [$PackageName in IntegrationPackagesNames]: string }
>();
