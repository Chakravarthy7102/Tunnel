import { env } from '@-/env';
import { WorkOS } from '@workos-inc/node';
import onetime from 'onetime';

// Initialize the WorkOS client
export const getWorkos = onetime(() => new WorkOS(env('WORKOS_API_KEY')));
