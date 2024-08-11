import { createTnlProperty } from './property.ts';
import { tnlProperties } from './tnl-aliases.ts';

export const sourceToRenderEventIdMap: Map<string, string> = createTnlProperty(
	tnlProperties.sourceToRenderEventIdMap,
	() => new Map(),
);
