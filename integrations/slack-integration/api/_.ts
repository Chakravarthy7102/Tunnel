import { createFlatNamespace } from '@tunnel/namespace';
import * as methods from './_.methods.ts';

export const ApiSlack = createFlatNamespace('ApiSlack', methods);
