import type { JSONContent } from '@tiptap/react';

export function extractMentionIds(
	block: JSONContent,
	mentionIds: string[],
): string[] {
	if (block.type === 'mention') {
		mentionIds.push(block.attrs?.id);
	}

	if (block.content) {
		for (const innerBlock of block.content) {
			extractMentionIds(innerBlock, mentionIds);
		}
	}

	return mentionIds;
}
