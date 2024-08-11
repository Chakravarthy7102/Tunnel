import { defineNextQueryHandler } from '#utils/define.ts';
import * as handlerActions from './_.actions.ts';
import * as handlerInputs from './_.input.ts';

export const fulfillLoginRequestOnAuthenticated = defineNextQueryHandler(
	'fulfillLoginRequestOnAuthenticated',
	{
		actions: {
			fulfillLoginRequest:
				handlerActions.fulfillLoginRequestOnAuthenticated_fulfillLoginRequest,
		},
		input: handlerInputs.fulfillLoginRequestOnAuthenticated_input,
	},
);

export const redirectOnAuthenticatedAsUser = defineNextQueryHandler(
	'redirectOnAuthenticatedAsUser',
	{
		actions: {
			getRedirectUrl:
				handlerActions.redirectOnAuthenticatedAsUser_getRedirectUrl,
		},
		input: handlerInputs.redirectOnAuthenticatedAsUser_input,
	},
);
