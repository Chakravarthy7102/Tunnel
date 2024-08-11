import type { ProjectCommentThreadFiltersSelection } from '#types';
import type { ValueOf } from 'type-fest';

export function isFilterActive(
	filterKey: string,
	filterChoice: ValueOf<ProjectCommentThreadFiltersSelection>,
) {
	if (filterKey === 'oneOfStatus') {
		return !(filterChoice.length === 1 && filterChoice[0] === 'unresolved');
	}

	return filterChoice.length > 0;
}
