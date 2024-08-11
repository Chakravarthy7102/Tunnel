import { createFlatNamespace } from '@tunnel/namespace';
import * as methods from './_.methods.ts';

export const ApiGitlab = createFlatNamespace('ApiGitlab', methods);
