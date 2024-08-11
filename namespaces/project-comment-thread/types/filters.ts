import type { projectCommentThreadFiltersSelectionSchema } from '#schemas/filters.ts';
import type { z } from '@-/zod';
import type { ValueOf } from 'type-fest';

export type ProjectCommentThreadFiltersSelection = z.infer<
	typeof projectCommentThreadFiltersSelectionSchema
>;

export type FilterKey = keyof ProjectCommentThreadFiltersSelection;
export type FilterChoiceValue = ValueOf<ProjectCommentThreadFiltersSelection>;

export interface NormalizedFilterChoice {
	name: string;
	value: any;
}

/**
	A map of each filter to its possible choices.
*/
export type FiltersChoicesMap = {
	[$FilterKey in FilterKey]?: NormalizedFilterChoice[];
};
