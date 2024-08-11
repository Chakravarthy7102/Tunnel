import { SvelteComponent } from 'svelte';
declare const __propDef: {
	props: {
		projectId: string;
		branch: string | undefined;
	};
	events: {
		[evt: string]: CustomEvent<any>;
	};
	slots: {};
};
export type ToolbarProps = typeof __propDef.props;
export type ToolbarEvents = typeof __propDef.events;
export type ToolbarSlots = typeof __propDef.slots;
export default class Toolbar
	extends SvelteComponent<ToolbarProps, ToolbarEvents, ToolbarSlots>
{
}
export {};
