'use client';

import { Button, cn } from '@-/design-system/v1';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export interface NetworkLogDataTableEntry {
	name: string;
	method: string;
	status: number;
	domain: string;
	type: string;
	size: number;
	time: number;
	requestBody: string;
	responseBody: string;
	responseHeaders: Record<string, string>;
	requestHeaders: Record<string, string>;
}

export const columns: ColumnDef<NetworkLogDataTableEntry>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		maxSize: 100,
		cell({ row }) {
			const name: string = row.getValue('name');

			return (
				<div className="flex items-center gap-x-2 max-w-[240px] text-ellipsis overflow-hidden whitespace-nowrap">
					{name}
				</div>
			);
		},
	},
	{
		accessorKey: 'method',
		header: 'Method',
	},
	{
		accessorKey: 'status',
		header({ column }) {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 gap-x-1"
				>
					Status
					<ArrowUpDown size={14} className="text-muted-foreground" />
				</Button>
			);
		},
		cell({ row }) {
			const status: number = row.getValue('status');

			if (status === 0) {
				return '-';
			}

			return (
				<div className="flex items-center gap-x-2">
					<div
						className={cn('h-2 w-2 rounded-full', {
							'bg-gray-500': status < 200 || status >= 600, // Default color for unknown status codes
							'bg-green-500': status >= 200 && status < 300, // Success
							'bg-blue-500': status >= 300 && status < 400, // Redirects
							'bg-yellow-500': status >= 400 && status < 500, // Client errors
							'bg-red-500': status >= 500 && status < 600, // Server errors
						})}
					/>
					{status}
				</div>
			);
		},
	},
	{
		accessorKey: 'domain',
		header: 'Domain',
	},
	{
		accessorKey: 'type',
		header: 'Type',
	},
	{
		accessorKey: 'size',
		header({ column }) {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 gap-x-1"
				>
					Size
					<ArrowUpDown size={14} className="text-muted-foreground" />
				</Button>
			);
		},
		cell({ row }) {
			const sizeInBytes: number = row.getValue('size');
			let displaySize = '-';

			if (sizeInBytes > 0) {
				if (sizeInBytes < 1024) {
					displaySize = `${sizeInBytes} B`;
				} else {
					const sizeInKB = sizeInBytes / 1024;
					if (sizeInKB < 1024) {
						displaySize = `${sizeInKB.toFixed(2)} KB`;
					} else {
						const sizeInMB = sizeInKB / 1024;
						displaySize = `${sizeInMB.toFixed(2)} MB`;
					}
				}
			}

			return <span className="min-w-max whitespace-nowrap">{displaySize}</span>;
		},
	},
	{
		accessorKey: 'time',
		header({ column }) {
			return (
				<Button
					variant="ghost"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
					className="px-0 gap-x-1"
				>
					Time
					<ArrowUpDown size={14} className="text-muted-foreground" />
				</Button>
			);
		},
		cell({ row }) {
			const timeInMilliseconds: number = row.getValue('time');

			let time = '';
			if (timeInMilliseconds <= 0) {
				time = '-';
			}

			const hours = timeInMilliseconds / 3_600_000;
			if (hours >= 1) {
				time = `${hours.toFixed(1)} h`;
			}

			const minutes = timeInMilliseconds / 60_000;
			if (minutes >= 1) {
				time = `${minutes.toFixed(1)} m`;
			}

			const seconds = timeInMilliseconds / 1000;
			if (seconds >= 1) {
				time = `${seconds.toFixed(1)} s`;
			}

			if (timeInMilliseconds > 0) {
				time = `${timeInMilliseconds.toFixed(1)} ms`;
			}

			return <span className="min-w-max whitespace-nowrap">{time}</span>;
		},
	},
];
