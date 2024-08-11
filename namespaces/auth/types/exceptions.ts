import type { WorkosUser } from '#types';
import type { OauthException } from '@workos-inc/node';

declare class OrganizationSelectionRequiredException extends Error {
	rawData: {
		code: 'organization_selection_required';
		message: string;
		pending_authentication_token: string;
		organizations: Array<{ id: string; name: string }>;
		user: WorkosUser;
	};
}

declare class MfaEnrollmentException extends Error {
	rawData: {
		code: 'mfa_enrollment';
		message: string;
		user: WorkosUser;
		pending_authentication_token: string;
	};
}

declare class MfaChallengeException extends Error {
	rawData: {
		code: 'mfa_challenge';
		message: string;
		authentication_factors: Array<{ id: string }>;
		pending_authentication_token: string;
	};
}

declare class EmailVerificationRequiredException extends Error {
	rawData: {
		code: 'email_verification_required';
		email: string;
		message: string;
		pending_authentication_token: string;
	};
}

export type WorkosOauthException =
	| OrganizationSelectionRequiredException
	| MfaEnrollmentException
	| MfaChallengeException
	| EmailVerificationRequiredException
	| (Omit<OauthException, 'rawData'> & {
		rawData: { code: undefined; message: string };
	});
