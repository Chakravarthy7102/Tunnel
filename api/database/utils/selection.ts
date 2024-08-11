import type { SelectInput, Selection, TableNames } from '#types';
import { logger } from '@-/logger';
import isEmpty from 'just-is-empty';
import type { EmptyObject } from 'type-fest';

export function defineSelection<
	$TableName extends TableNames,
	const $Include extends SelectInput<$TableName>,
>(
	tableName: $TableName,
	includeGetter: () => $Include,
): Selection<$TableName, $Include> {
	return {
		tableName,
		include: includeGetter as any,
	};
}

export function getInclude<$Selection extends Selection | EmptyObject>(
	selection: $Selection,
): $Selection extends Selection ? $Selection['include'] : {} {
	if ('include' in selection) {
		if (typeof selection.include !== 'function') {
			logger.error('Invalid selection:', selection);
			throw new TypeError('Invalid selection');
		}

		return selection.include();
	}

	if (isEmpty(selection)) {
		// @ts-expect-error: Broken typescript
		return {};
	}

	throw new TypeError('Invalid selection');
}
