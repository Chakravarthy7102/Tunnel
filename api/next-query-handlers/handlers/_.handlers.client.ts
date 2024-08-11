import { defineClientNextQueryHandler } from '#utils/define.client.ts';
import * as handlerInputs from './_.input.ts';

export const fulfillLoginRequestOnAuthenticated = defineClientNextQueryHandler(
	'fulfillLoginRequestOnAuthenticated',
	{ input: handlerInputs.fulfillLoginRequestOnAuthenticated_input },
);

export const redirectOnAuthenticatedAsUser = defineClientNextQueryHandler(
	'redirectOnAuthenticatedAsUser',
	{ input: handlerInputs.redirectOnAuthenticatedAsUser_input },
);
