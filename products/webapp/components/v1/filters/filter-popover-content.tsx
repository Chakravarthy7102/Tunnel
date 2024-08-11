import { filterMetadata } from '#utils/filter.tsx';
import {
	Checkbox,
	Command,
	CommandContent,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from '@-/design-system/v1';
import type {
	FilterChoiceValue,
	NormalizedFilterChoice,
	ProjectCommentThreadFiltersSelection,
} from '@-/project-comment-thread';
import { useState } from 'react';

export function FilterPopoverContent({
	filterKey,
	filterChoices,
	onSelect,
	onDeselect,
	selectedFilterChoiceValue,
}: {
	filterKey: keyof ProjectCommentThreadFiltersSelection;
	filterChoices: Array<NormalizedFilterChoice> | undefined;
	selectedFilterChoiceValue: FilterChoiceValue;
	onSelect: (value: string) => void;
	onDeselect: (value: string) => void;
}) {
	const [query, setQuery] = useState('');

	const onSelectToggle = (filterChoice: NormalizedFilterChoice) => {
		const isSelected = selectedFilterChoiceValue.includes(filterChoice.value);

		if (!isSelected) {
			onSelect(filterChoice.value);
		} else {
			onDeselect(filterChoice.value);
		}
	};

	return (
		<Command>
			<CommandInput
				placeholder={`Search ${filterMetadata[filterKey].plural}...`}
				className="h-9"
				value={query}
				onValueChange={(e) => setQuery(e)}
			/>
			<CommandContent isLoading={filterChoices === undefined}>
				<CommandEmpty>
					No {filterMetadata[filterKey].plural} found.
				</CommandEmpty>
				<CommandGroup>
					{query === '' && filterMetadata[filterKey].canIncludeNull && (
						<CommandItem
							key=""
							onSelect={() => {
								onSelectToggle({
									name: 'No ' + filterMetadata[filterKey].singular,
									value: null,
								});
							}}
							className="gap-x-2 focus:border-input border border-solid justify-between"
						>
							<span>No {filterMetadata[filterKey].singular}</span>
							<Checkbox
								checked={
									// @ts-expect-error: todo
									selectedFilterChoiceValue.includes(null)
								}
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onSelectToggle({
										name: 'No ' + filterMetadata[filterKey].singular,
										value: null,
									});
								}}
							/>
						</CommandItem>
					)}
					{filterChoices?.map((filterChoice) => {
						return (
							<CommandItem
								key={filterChoice.value}
								onSelect={() => {
									onSelectToggle(filterChoice);
								}}
								className="gap-x-2 focus:border-input border border-solid justify-between"
							>
								<span>{filterChoice.name}</span>
								<Checkbox
									checked={Array.isArray(selectedFilterChoiceValue) ?
										selectedFilterChoiceValue.includes(filterChoice.value) :
										selectedFilterChoiceValue === filterChoice.value}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										onSelectToggle(filterChoice);
									}}
								/>
							</CommandItem>
						);
					})}
				</CommandGroup>
			</CommandContent>
		</Command>
	);
}
