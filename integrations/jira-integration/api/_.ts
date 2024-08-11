import { createFlatNamespace } from '@tunnel/namespace';
import * as methods from './_.methods.ts';

export const ApiJira = createFlatNamespace('ApiJira', methods);
