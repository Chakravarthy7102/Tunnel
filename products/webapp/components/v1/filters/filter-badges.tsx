import { useDocumentBody } from '#utils/document.ts';
import { filterMetadata } from '#utils/filter.tsx';
import type { CommentsContext } from '@-/comments';
import {
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@-/design-system/v1';
import {
	type FiltersChoicesMap,
	isFilterActive,
	type NormalizedFilterChoice,
	type ProjectCommentThreadFiltersSelection,
} from '@-/project-comment-thread';
import { objectKeys } from '@tunnel/ts';
import { Plus, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { FilterDropdownButton } from './filter-dropdown-button.tsx';
import { FilterPopoverContent } from './filter-popover-content.tsx';

export function FilterBadges({
	commentsContext,
	filtersSelection,
	setFiltersSelection,
	filtersChoicesMap,
}: {
	commentsContext: CommentsContext;
	filtersSelection: ProjectCommentThreadFiltersSelection;
	setFiltersSelection: Dispatch<
		SetStateAction<ProjectCommentThreadFiltersSelection>
	>;
	filtersChoicesMap: FiltersChoicesMap;
}) {
	const filterKeys = objectKeys(filtersSelection);

	return (
		<div className="flex flex-row justify-center items-center flex-wrap gap-x-2">
			{filterKeys.map(
				(filterKey) =>
					isFilterActive(filterKey, filtersSelection[filterKey]) && (
						<FilterBadge
							key={filterKey}
							filterKey={filterKey}
							filtersSelection={filtersSelection}
							setFiltersSelection={setFiltersSelection}
							filterChoices={filtersChoicesMap[filterKey]}
						/>
					),
			)}
			<FilterDropdownButton
				commentsContext={commentsContext}
				filtersSelection={filtersSelection}
				setFiltersSelection={setFiltersSelection}
				filtersChoicesMap={filtersChoicesMap}
				size="icon"
				variant="ghost"
				alignDropdownContent="center"
				alignPopoverContent="center"
			>
				<Plus size={16} />
			</FilterDropdownButton>
		</div>
	);
}

function FilterBadge({
	filtersSelection,
	setFiltersSelection,
	filterKey,
	filterChoices,
}: {
	filtersSelection: ProjectCommentThreadFiltersSelection;
	setFiltersSelection: Dispatch<
		SetStateAction<ProjectCommentThreadFiltersSelection>
	>;
	filterKey: keyof ProjectCommentThreadFiltersSelection;
	filterChoices: NormalizedFilterChoice[] | boolean | undefined;
}) {
	const selectedFilterChoiceValue = filtersSelection[filterKey];
	const documentBody = useDocumentBody();

	return (
		<Popover>
			<div className="flex flex-row justify-center items-center border border-input border-solid rounded-[5px] bg-popover">
				<div className="text-secondary-foreground text-sm p-1.5 font-light flex flex-row justify-center items-center gap-x-1.5">
					{filterMetadata[filterKey].icon}
					{filterMetadata[filterKey].singular}
				</div>
				<div className="text-muted-foreground text-sm p-1.5 font-light">
					{Array.isArray(selectedFilterChoiceValue) &&
							selectedFilterChoiceValue.length > 1 ?
						'any of' :
						'is'}
				</div>
				<Tooltip>
					<TooltipContent>{filterMetadata[filterKey].singular}</TooltipContent>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								className="text-sm p-1.5 font-light rounded-none"
							>
								{typeof filterChoices === 'boolean' ?
									selectedFilterChoiceValue :
									Array.isArray(selectedFilterChoiceValue) &&
										selectedFilterChoiceValue.length > 1 ?
									`${selectedFilterChoiceValue.length} ${
										filterMetadata[filterKey].plural
									}` :
									Array.isArray(selectedFilterChoiceValue) ?
									selectedFilterChoiceValue
										.map(
											(choiceId) =>
												choiceId === null ?
													'empty' :
													filterChoices?.find(
														(choice) => choice.value === choiceId,
													)?.name,
										)
										.join(',') :
									filterChoices?.find((choice) =>
										choice.value === selectedFilterChoiceValue
									)?.name ?? String(selectedFilterChoiceValue)}
							</Button>
						</PopoverTrigger>
					</TooltipTrigger>
				</Tooltip>
				<Tooltip>
					<TooltipContent>Remove filters</TooltipContent>
					<TooltipTrigger asChild>
						<Button
							onClick={() => {
								if (Array.isArray(selectedFilterChoiceValue)) {
									setFiltersSelection((filtersSelection) => ({
										...filtersSelection,
										[filterKey]: filterKey === 'oneOfStatus' ?
											['unresolved'] :
											[],
									}));
								} else {
									setFiltersSelection((filtersSelection) => ({
										...filtersSelection,
										[filterKey]: null,
									}));
								}
							}}
							variant="ghost"
							className="p-1.5 rounded-none"
						>
							<X className="text-muted-foreground" size={16} />
						</Button>
					</TooltipTrigger>
				</Tooltip>
			</div>

			<PopoverContent container={documentBody} style={{ padding: 0 }}>
				{Array.isArray(filterChoices) && (
					<FilterPopoverContent
						filterKey={filterKey}
						filterChoices={filterChoices}
						selectedFilterChoiceValue={selectedFilterChoiceValue}
						onSelect={(value) => {
							setFiltersSelection((filtersSelection) => {
								const filterChoiceValue = filtersSelection[filterKey];
								if (Array.isArray(filterChoiceValue)) {
									return {
										...filtersSelection,
										[filterKey]: [...filterChoiceValue, value],
									};
								} else {
									return {
										...filtersSelection,
										[filterKey]: value,
									};
								}
							});
						}}
						onDeselect={(filterValue) => {
							setFiltersSelection((filtersSelection) => {
								const filterChoiceValue = filtersSelection[filterKey];
								if (Array.isArray(filterChoiceValue)) {
									return {
										...filtersSelection,
										[filterKey]: filterChoiceValue.filter(
											(value) => value !== filterValue,
										),
									};
								} else {
									return {
										...filtersSelection,
										[filterKey]: null,
									};
								}
							});
						}}
					/>
				)}
			</PopoverContent>
		</Popover>
	);
}
