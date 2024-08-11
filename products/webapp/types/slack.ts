export interface SlackSlashCommandPayload {
	token: string;
	team_id: string;
	team_domain: string;
	enterprise_id?: string;
	enterprise_name?: string;
	channel_id: string;
	channel_name: string;
	user_id: string;
	user_name: string;
	command: string;
	text: string;
	response_url: string;
	trigger_id: string;
	api_app_id: string;
}

export interface SlackLoginJWT {
	userId: string;
	teamDomain: string;
	channelId: string;
	responseUrl: string;
}

export interface SlackInteractionPayload {
	payload: {
		type: string;
		user: {
			id: string;
			username: string;
			name: string;
			team_id: string;
		};
		api_app_id: string;
		token: string;
		container: {
			type: string;
			view_id: string;
		};
		trigger_id: string;
		team: {
			id: string;
			domain: string;
		};
		enterprise: unknown;
		is_enterprise_install: boolean;
		channel: {
			id: string;
			name: string;
		};
		message: {
			ts: string;
		};
		state: {
			values: unknown;
		};
		view: {
			hash: string;
			private_metadata: string;
			state: {
				values: {
					[key: string]: {
						[subKey: string]: {
							type: string;
							selected_option: {
								text: {
									type: string;
									text: string;
									emoji?: boolean;
								};
								value?: string;
							};
						};
					};
				};
			};
		};

		response_url: string;
		actions?: {
			action_id: string;
			block_id: string;
			text: {
				type: string;
				text: string;
				emoji: boolean;
			};
			selected_option: {
				value: string;
			};
			value: string;
			type: string;
			action_ts: string;
		}[];
	};
}

export type SlackPayload = SlackSlashCommandPayload & SlackInteractionPayload;
