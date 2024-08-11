import type {
	consoleLogEntrySchema,
	networkLogEntrySchema,
	sessionEventItemSchema,
} from '#schemas/logs.ts';
import type { z } from '@-/zod';

export type NetworkLogEntry = z.infer<typeof networkLogEntrySchema>;
export type ConsoleLogEntry = z.infer<typeof consoleLogEntrySchema>;
export type SessionEventItem = z.infer<typeof sessionEventItemSchema>;
export interface LogEntries {
	networkHistory: NetworkLogEntry[];
	consoleHistory: ConsoleLogEntry[];
}
export interface SessionItems {
	events: SessionEventItem[];
}
