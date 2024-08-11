export interface Mentionable {
	id: string;
	text: string;
	data: {
		profileImageUrl: string | null;
	};
}
