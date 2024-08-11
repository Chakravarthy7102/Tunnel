import { v } from '@-/convex/values';
import { table, vDeprecated, vNew, vNullable } from 'corvex';

export const ProjectCommentThreadWindowMetadata = table(
	'ProjectCommentThreadWindowMetadata',
	v.object({
		projectCommentThread: v.id('ProjectCommentThread'),
		url: v.string(),
		timestamp: v.string(),
		os: vNew(
			v.object({
				name: vNullable(v.string()),
				version: vNullable(v.string()),
			}),
		),
		browser: vNew(
			v.object({
				name: vNullable(v.string()),
				version: vNullable(v.string()),
			}),
		),
		windowSize: vNew(
			v.object({
				width: v.number(),
				height: v.number(),
			}),
		),
		browserName: vDeprecated<string | null>('Use `browser.name` instead'),
		browserVersion: vDeprecated<string | null>('Use `browser.version` instead'),
		osName: vDeprecated<string | null>('Use `os.name` instead'),
		osVersion: vDeprecated<string | null>('Use `os.version` instead'),
		windowWidth: vDeprecated<number>('Use `windowSize.width` instead'),
		windowHeight: vDeprecated<number>('Use `windowSize.height` instead'),
		cid: vDeprecated<number>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_url', ['url'])
			.index('by_osName', ['os.name'])
			.index('by_osVersion', ['os.version'])
			.index('by_browserName', ['browser.name'])
			.index('by_browserVersion', ['browser.version'])
			.index('by_windowWidth', ['windowSize.width'])
			.index('by_windowHeight', ['windowSize.height']),
)({
	browser: {
		default: (document) => ({
			name: document.browserName,
			version: document.browserVersion,
		}),
	},
	os: {
		default: (document) => ({
			name: document.osName,
			version: document.osVersion,
		}),
	},
	windowSize: {
		default: (document) => ({
			height: document.windowHeight,
			width: document.windowWidth,
		}),
	},
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
});
