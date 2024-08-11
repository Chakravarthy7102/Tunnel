// eslint-disable-next-line no-restricted-imports -- This is the only file that's allowed to import Zod
import { z as zod } from 'zod';
import { errorMap } from 'zod-validation-error';

zod.setErrorMap(errorMap);

// eslint-disable-next-line no-restricted-imports -- This is the only file that's allowed to import Zod
export * from 'zod';
