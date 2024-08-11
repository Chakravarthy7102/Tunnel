import type { JSONContent } from '@-/comments';

export type Notification<$NotificationType extends string = string> =
	& (
		| {
			id: string;
			type: 'NewProjectComment';
			authorUser: {
				_id: string;
				name: string;
			};
			content: JSONContent[];
			parentThreadId: string;
		}
		| {
			id: string;
			type: 'PortProxyRequestBlocked';
			portNumber: number;
			isDisallowed: boolean;
		}
		| {
			id: string;
			type: 'InvalidGitConfiguration';
			message: string;
		}
	)
	& {
		type: $NotificationType;
	};
