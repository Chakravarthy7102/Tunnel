export const LOCATORS = [
	'tag',
	'class',
	'name',
	'id',
	'href',
	'alt',
	'xpath',
	'idxpath',
	'is_button',
	'visible_text',
] as const;
export const WEIGHTS = [
	1.5,
	0.5,
	1.5,
	1.5,
	0.5,
	0.5,
	0.5,
	0.5,
	0.5,
	1.5,
] as const;

export const SIMILARITY_FUNCTION = [0, 1, 0, 0, 1, 1, 1, 1, 0, 1] as const;
