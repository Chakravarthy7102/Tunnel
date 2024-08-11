import {
	Button,
	Checkbox,
	cn,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
} from '@-/design-system/v1';
import type { ConsoleLogEntry } from '@-/logs';
import { ChevronDown, ChevronRightSquare, Search } from 'lucide-react';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useRef,
	useState,
} from 'react';
import { ConsoleLogsList } from './console-logs-list.tsx';

export function ConsoleLogs({
	consoleLogs,
	container,
}: {
	consoleLogs: ConsoleLogEntry[] | undefined;
	container: HTMLElement | null;
}) {
	const [logsContainerDimensions, setLogsContainerDimensions] = useState<
		{ width: number; height: number } | null
	>(null);
	const [searchFilterQuery, setSearchFilterQuery] = useState<string>('');
	const [filteredCommentThreadLogs, setFilteredCommentThreadLogs] = useState<
		ConsoleLogEntry[]
	>(
		consoleLogs ?? [],
	);
	const [levels, setLevels] = useState<string[]>([
		'debug',
		'warn',
		'info',
		'log',
		'error',
	]);

	const logsContainerDiv = useRef<HTMLDivElement | null>(null);
	const resizeObserverRef = useRef<ResizeObserver>(
		new ResizeObserver(() => {
			if (logsContainerDiv.current === null) {
				return;
			}

			const { width, height } = logsContainerDiv.current
				.getBoundingClientRect();
			setLogsContainerDimensions({ width, height });
		}),
	);
	const logsContainerCallbackRef = useCallback((div: HTMLDivElement | null) => {
		logsContainerDiv.current = div;

		if (div !== null) {
			resizeObserverRef.current.observe(div);
			const { width, height } = div.getBoundingClientRect();
			setLogsContainerDimensions({ width, height });
		} else {
			resizeObserverRef.current.disconnect();
		}
	}, []);

	if (
		consoleLogs === undefined || consoleLogs.length === 0
	) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
				<ChevronRightSquare size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	return (
		<div
			className="w-full h-full gap-y-2 flex flex-col justify-center items-center"
			ref={logsContainerCallbackRef}
		>
			<div
				className={'flex flex-row justify-center gap-x-2 items-center h-9 w-full text-accent-foreground font-light rounded-md border hover:border-blue-500 border-input bg-popover pl-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-blue-500'}
			>
				<Search size={14} className="text-foreground" />
				<input
					className="w-full h-8 bg-transparent outline-none placeholder:text-muted-foreground"
					placeholder="Filter console logs"
					value={searchFilterQuery}
					onChange={(e) => {
						setSearchFilterQuery(e.target.value);

						let isDifferent = false;
						const newLogs = [];
						const currentLogIds = filteredCommentThreadLogs.map((log) =>
							log.id
						);

						const newLogIds = [];

						for (const log of consoleLogs) {
							if (
								log.payload.some((payload) =>
									payload.toLowerCase().includes(e.target.value.toLowerCase())
								) &&
								levels.includes(log.type)
							) {
								newLogs.push(log);
								newLogIds.push(log.id);

								const currentIndex = currentLogIds.indexOf(log.id);
								if (
									currentIndex === -1 || currentIndex !== newLogIds.length - 1
								) {
									isDifferent = true;
								}
							}
						}

						if (isDifferent || newLogIds.length !== currentLogIds.length) {
							setFilteredCommentThreadLogs(newLogs);
						}
					}}
				/>
				<LevelsMultiselect
					logs={consoleLogs}
					searchFilterQuery={searchFilterQuery}
					setFilteredCommentThreadLogs={setFilteredCommentThreadLogs}
					levels={levels}
					setLevels={setLevels}
					container={container}
				/>
			</div>

			{logsContainerDimensions !== null && (
				<div className="w-full h-full flex flex-col justify-start items-center bg-secondary rounded-[5px] border-input border border-solid">
					{filteredCommentThreadLogs.length > 0 ?
						(
							<ConsoleLogsList
								container={container}
								logs={filteredCommentThreadLogs}
							/>
						) :
						(
							<div className="h-full w-full flex flex-col justify-center items-center gap-y-2">
								<ChevronRightSquare
									size={48}
									className="text-muted-foreground"
								/>
								<p className="text-muted-foreground">
									Nothing to see here
								</p>
							</div>
						)}
				</div>
			)}
			{logsContainerDimensions === null && (
				<Skeleton className="h-full w-full" />
			)}
		</div>
	);
}

function LevelsMultiselect({
	logs,
	setFilteredCommentThreadLogs,
	searchFilterQuery,
	levels,
	setLevels,
	container,
}: {
	logs: ConsoleLogEntry[];
	setFilteredCommentThreadLogs: Dispatch<SetStateAction<ConsoleLogEntry[]>>;
	searchFilterQuery: string;
	levels: string[];
	setLevels: Dispatch<
		SetStateAction<string[]>
	>;
	container: HTMLElement | null;
}) {
	const availableLevels = [
		'log',
		'error',
		'warn',
		'debug',
		'info',
	];

	const [isOpen, setIsOpen] = useState(false);

	const selectLevel = (level: string) => {
		const newLevels = [...levels, level];
		setLevels(newLevels);

		const newLogs = logs.filter((log) => {
			const logPassesLevelFilter = newLevels.includes(log.type);
			const logPassesSearchFilter = log.payload.some((payload: string) =>
				payload.toLowerCase().includes(searchFilterQuery.toLowerCase())
			);
			return logPassesLevelFilter && logPassesSearchFilter;
		});

		setFilteredCommentThreadLogs(newLogs);
	};

	const deselectLevel = (level: string) => {
		const newLevels = levels.filter((l) => level !== l);
		setLevels(newLevels);

		setFilteredCommentThreadLogs((oldLogs) => {
			return oldLogs.filter((log) => {
				return newLevels.includes(log.type);
			});
		});
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					role="combobox"
					// aria-expanded={isOpen}
					className="gap-x-2 justify-between px-2 h-8 py-2 min-w-max"
				>
					{levels.length === 4 && 'All levels'}
					{levels.length === 0 && 'No levels'}
					{levels.length !== 4 && levels.length > 1 && 'Multiple levels'}
					{levels.length === 1 && levels[0] &&
						levels[0].charAt(0).toUpperCase() + levels[0].slice(1)}
					<ChevronDown
						size={14}
						className={cn(
							isOpen ? 'rotate-180' : '',
							'min-w-max transition-all text-muted-foreground',
						)}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="min-w-[200px] p-1 w-[200px] pointer-events-auto"
				container={container}
				align="end"
			>
				{availableLevels.map((level: string) => (
					<div
						key={level}
						onClick={() => {
							if (levels.includes(level)) {
								deselectLevel(level);
							} else {
								selectLevel(level);
							}
						}}
						className="w-full relative flex px-2 py-1.5 text-sm font-medium justify-between hover:bg-accent border border-solid border-transparent hover:border-input hover:cursor-pointer rounded-[5px]"
					>
						<span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
						<Checkbox
							checked={levels.includes(level)}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();

								if (levels.includes(level)) {
									deselectLevel(level);
								} else {
									selectLevel(level);
								}
							}}
						/>
					</div>
				))}
			</PopoverContent>
		</Popover>
	);
}
