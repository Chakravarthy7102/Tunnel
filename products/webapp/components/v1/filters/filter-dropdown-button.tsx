import { useDocumentBody } from '#utils/document.ts';
import { filterMetadata } from '#utils/filter.tsx';
import type { CommentsContext } from '@-/comments';
import {
	Button,
	type ButtonProps,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	Popover,
	PopoverAnchor,
	PopoverContent,
	type PopoverContentProps,
} from '@-/design-system/v1';
import type {
	FilterKey,
	FiltersChoicesMap,
	NormalizedFilterChoice,
	ProjectCommentThreadFiltersSelection,
} from '@-/project-comment-thread';
import {
	type Dispatch,
	type MutableRefObject,
	type SetStateAction,
	useRef,
	useState,
} from 'react';
import { FilterPopoverContent } from './filter-popover-content.tsx';

export const objectEntries = <$Object extends object>(object: $Object) =>
	Object.entries(object) as Array<[keyof $Object, $Object[keyof $Object]]>;

export function FilterDropdownButton({
	commentsContext: _,
	filtersSelection,
	setFiltersSelection,
	filtersChoicesMap,
	alignDropdownContent,
	alignPopoverContent,
	...props
}: ButtonProps & {
	commentsContext: CommentsContext;
	filtersSelection: ProjectCommentThreadFiltersSelection;
	setFiltersSelection: Dispatch<
		SetStateAction<ProjectCommentThreadFiltersSelection>
	>;
	filtersChoicesMap: Partial<FiltersChoicesMap>;
	alignPopoverContent?: PopoverContentProps['align'];
	alignDropdownContent?: PopoverContentProps['align'];
}) {
	const [hasOpenDialog, setHasOpenDialog] = useState(false);
	const dropdownMenuContentRef = useRef<HTMLDivElement | null>(null);
	const documentBody = useDocumentBody();
	const popoverContentValueRef = useRef<FilterKey | null>(null);

	const jiraKeys = [
		'allOfJiraLabels',
		'oneOfJiraIssueAssigneeAccountIds',
		'oneOfJiraIssueKeys',
		'oneOfJiraIssueProjectIds',
		'oneOfJiraIssueTypeIds',
	] satisfies (keyof ProjectCommentThreadFiltersSelection)[];

	const linearKeys = [
		'allOfLinearIssueLabelIds',
		'oneOfLinearIssueAssigneeIds',
		'oneOfLinearIssueIdentifiers',
		'oneOfLinearIssuePriorityLabels',
		'oneOfLinearIssueProjectIds',
		'oneOfLinearIssueStatusIds',
		'oneOfLinearIssueTeamIds',
	] satisfies (keyof ProjectCommentThreadFiltersSelection)[];

	const hasJiraChoice = jiraKeys.some((key) => {
		const filtersChoices = filtersChoicesMap[key];
		return Array.isArray(filtersChoices) && filtersChoices.length > 0;
	});

	const hasLinearChoice = linearKeys.some((key) => {
		const filtersChoices = filtersChoicesMap[key];
		return Array.isArray(filtersChoices) && filtersChoices.length > 0;
	});

	const FilterDropdownMenuItemByKey = (
		{ filterKey }: { filterKey: FilterKey },
	) => (
		<FilterDropdownMenuItem
			filterChoices={filtersChoicesMap[filterKey]}
			filterKey={filterKey}
			popoverContentValueRef={popoverContentValueRef}
			setHasOpenDialog={setHasOpenDialog}
		/>
	);

	return (
		<DropdownMenu modal={false}>
			<Popover
				onOpenChange={(opened) => {
					setHasOpenDialog(opened);
					popoverContentValueRef.current = null;
				}}
				open={hasOpenDialog}
			>
				<PopoverAnchor>
					<DropdownMenuTrigger asChild>
						<Button {...props} />
					</DropdownMenuTrigger>
				</PopoverAnchor>
				<DropdownMenuContent
					sideOffset={5}
					hidden={hasOpenDialog}
					ref={dropdownMenuContentRef}
					style={{
						pointerEvents: hasOpenDialog ? 'none' : 'auto',
					}}
					container={documentBody}
					align={alignDropdownContent ?? 'start'}
				>
					<DropdownMenuGroup>
						<FilterDropdownMenuItemByKey filterKey="oneOfAuthorUserIds" />
						<FilterDropdownMenuItemByKey filterKey="oneOfProjectIds" />
						<FilterDropdownMenuItemByKey filterKey="oneOfStatus" />
						{hasLinearChoice && (
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										className="fill-muted-foreground"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M2.24496 14.3045C2.20047 14.1148 2.42645 13.9954 2.56426 14.1331L9.86673 21.4356C10.0045 21.5734 9.88505 21.7994 9.69532 21.7549C6.0102 20.8904 3.10946 17.9897 2.24496 14.3045Z" />
										<path d="M2.00038 11.3778C1.99683 11.4345 2.01816 11.4898 2.05827 11.5299L12.4701 21.9417C12.5102 21.9819 12.5655 22.0032 12.6222 21.9996C13.096 21.9701 13.5609 21.9076 14.0146 21.8145C14.1675 21.7831 14.2207 21.5952 14.1103 21.4848L2.51519 9.88971C2.4048 9.77936 2.21695 9.83249 2.18554 9.98538C2.09237 10.4391 2.02988 10.904 2.00038 11.3778Z" />
										<path d="M2.84209 7.94107C2.80881 8.01584 2.82576 8.10318 2.88361 8.16104L15.8389 21.1163C15.8967 21.1741 15.984 21.1911 16.0588 21.1578C16.416 20.9987 16.7623 20.8193 17.0959 20.621C17.2064 20.5554 17.2234 20.4037 17.1326 20.3128L3.68705 6.86732C3.59623 6.7765 3.44451 6.79353 3.37889 6.90396C3.1806 7.23764 3.00119 7.58385 2.84209 7.94107Z" />
										<path d="M4.53162 5.61481C4.45759 5.54078 4.45298 5.42203 4.52275 5.34399C6.35576 3.29188 9.02213 2 11.9903 2C17.5184 2 21.9999 6.48145 21.9999 12.0096C21.9999 14.9777 20.708 17.6441 18.6559 19.4771C18.5778 19.5469 18.4591 19.5423 18.3851 19.4682L4.53162 5.61481Z" />
									</svg>
									Linear Issue
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<FilterDropdownMenuItemByKey filterKey="oneOfLinearIssueTeamIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfLinearIssueProjectIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfLinearIssueStatusIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfLinearIssueIdentifiers" />
									<FilterDropdownMenuItemByKey filterKey="oneOfLinearIssueAssigneeIds" />
									<FilterDropdownMenuItemByKey filterKey="allOfLinearIssueLabelIds" />
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						)}
						{hasJiraChoice && (
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										className="fill-muted-foreground"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M12.0029 22C14.0011 20.0645 14.0011 16.8848 12.0029 14.9493L5.29455 8.49768L2.24977 11.447C1.91674 11.7696 1.91674 12.2765 2.24977 12.553L12.0029 22Z" />
										<path d="M21.7555 11.447L12.0024 2L11.9547 2.04608C9.95651 3.98156 9.95651 7.11521 11.9547 9.0507L18.663 15.5023L21.7078 12.553C22.0884 12.2304 22.0885 11.7235 21.7555 11.447Z" />
										<path d="M12.0025 9.00461C10.0043 7.06913 10.0043 3.93548 12.0025 2L5.00879 8.72812L8.62457 12.2304L12.0025 9.00461Z" />
										<path d="M15.3337 11.7235L12.0034 14.9493C14.0016 16.8848 14.0016 20.0645 12.0034 22L18.9971 15.2258L15.3337 11.7235Z" />
									</svg>
									Jira Issue
								</DropdownMenuSubTrigger>

								<DropdownMenuSubContent>
									<FilterDropdownMenuItemByKey filterKey="oneOfJiraIssueAssigneeAccountIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfJiraIssueProjectIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfJiraIssueTypeIds" />
									<FilterDropdownMenuItemByKey filterKey="oneOfJiraIssueKeys" />
									<FilterDropdownMenuItemByKey filterKey="allOfJiraLabels" />
								</DropdownMenuSubContent>
							</DropdownMenuSub>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
				<PopoverContent
					container={documentBody}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
					}}
					style={{
						zIndex: 2000,
						padding: 0,
					}}
					align={alignPopoverContent ?? 'start'}
				>
					{objectEntries(filtersChoicesMap).map(
						([filterKey, filterChoices]) => {
							if (popoverContentValueRef.current === filterKey) {
								return (
									<FilterPopoverContent
										key={filterKey}
										filterChoices={filterChoices}
										filterKey={filterKey}
										onSelect={(value) => {
											setFiltersSelection((filtersSelection) => {
												const filterChoiceValue = filtersSelection[filterKey];
												if (Array.isArray(filterChoiceValue)) {
													return {
														...filtersSelection,
														[filterKey]: [
															...filterChoiceValue,
															value,
														],
													};
												} else {
													return {
														...filtersSelection,
														[filterKey]: value,
													};
												}
											});
										}}
										onDeselect={(value) => {
											setFiltersSelection((filtersSelection) => {
												const filterChoiceValue = filtersSelection[filterKey];
												if (Array.isArray(filterChoiceValue)) {
													return {
														...filtersSelection,
														[filterKey]: filterChoiceValue.filter(
															(filterValue) => filterValue !== value,
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
										selectedFilterChoiceValue={filtersSelection[filterKey]}
									/>
								);
							}

							return null;
						},
					)}
				</PopoverContent>
			</Popover>
		</DropdownMenu>
	);
}

function FilterDropdownMenuItem({
	setHasOpenDialog,
	popoverContentValueRef,
	filterKey,
	filterChoices,
}: {
	setHasOpenDialog: Dispatch<SetStateAction<boolean>>;
	popoverContentValueRef: MutableRefObject<
		keyof ProjectCommentThreadFiltersSelection | null
	>;
	filterKey: keyof ProjectCommentThreadFiltersSelection;
	filterChoices: NormalizedFilterChoice[] | boolean | undefined;
}) {
	if (filterChoices === undefined) {
		return null;
	}

	return (
		<DropdownMenuItem
			onSelect={(event) => {
				event.preventDefault();
				event.stopPropagation();
				setHasOpenDialog(true);
				popoverContentValueRef.current = filterKey;
			}}
		>
			{filterMetadata[filterKey].icon}
			{filterMetadata[filterKey].dropdownLabel}
		</DropdownMenuItem>
	);
}
