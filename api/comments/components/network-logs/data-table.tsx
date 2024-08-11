'use client';

import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@-/design-system/v1';
import { ChevronRightSquare, Search } from 'lucide-react';
import { useState } from 'react';
import { InformationDialog } from './information-dialog.tsx';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	container: HTMLElement | null;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	container,
}: DataTableProps<TData, TValue>) {
	const [req, setReq] = useState<any>(null);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
		},
	});

	return (
		<div className="flex flex-col justify-start items-center gap-y-2 w-full h-full">
			<div
				className={'flex flex-row justify-center gap-x-2 items-center h-9 w-full text-accent-foreground font-light rounded-md border hover:border-blue-500 border-input bg-popover pl-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500'}
			>
				<Search size={14} className="text-foreground" />
				<input
					className="w-full h-8 bg-transparent outline-none placeholder:text-muted-foreground"
					placeholder="Filter network logs"
					value={table.getColumn('name')?.getFilterValue() as string}
					onChange={(event) =>
						table.getColumn('name')?.setFilterValue(event.target.value)}
				/>
			</div>

			<div className="rounded-md border border-solid border-input w-full overflow-hidden flex tunnel-track bg-secondary text-foreground">
				<Table>
					<TableHeader className="sticky top-[-1px] border-none">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="bg-accent"
							>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ?
												null :
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="h-full">
						{table.getRowModel().rows.length > 0 ?
							(
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && 'selected'}
										onClick={() => {
											setReq(row.original);
										}}
										className="hover:cursor-pointer"
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) :
							(
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-full text-center"
									>
										<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
											<ChevronRightSquare
												size={48}
												className="text-muted-foreground"
											/>
											<p className="text-muted-foreground">
												Nothing to see here
											</p>
										</div>
									</TableCell>
								</TableRow>
							)}
					</TableBody>
				</Table>

				<InformationDialog
					setIsOpen={(isOpen: boolean) => {
						if (!isOpen) {
							setReq(null);
						}
					}}
					networkLogEntry={req}
					container={container}
				/>
			</div>
		</div>
	);
}
