import { createFlatNamespace } from '@tunnel/namespace';
import * as methods from './_.methods.ts';

export const WebappApiActor = createFlatNamespace('WebappApiActor', methods);
