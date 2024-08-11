import { MentionList } from '#components/tiptap/mention/mention-list.tsx';
import type { Mentionable } from '#components/tiptap/types/mentionable.ts';
import { useComments } from '#hooks/comments.ts';
import type { CommentsContext } from '#types';
import type { ClientDoc } from '@-/client-doc';
import HardBreak from '@tiptap/extension-hard-break';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Extension, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Plugin, PluginKey } from 'prosemirror-state';
import { useEffect, useRef, useState } from 'react';
import tippy from 'tippy';

export function useExtensions({
	commentsContext,
	organization,
}: {
	commentsContext: CommentsContext;
	organization: ClientDoc<'Organization'> | null;
}) {
	const { commentsState, trpc } = useComments(commentsContext);
	const [_shouldLoadMembers, setShouldLoadMembers] = useState(false);
	const { data: organizationMembers } = trpc.organization.listMembers.useQuery(
		{
			actor: commentsState.userActor,
			organization: {
				id: organization?._id ?? '',
			},
			includeProjectGuests: true,
		},
		{ enabled: organization !== null /* && shouldLoadMembers */ },
	);

	const mentionablesRef = useRef<Mentionable[]>([]);

	useEffect(() => {
		mentionablesRef.current = organizationMembers?.isOk() ?
			organizationMembers.value.map(({ user }) => {
				return {
					id: user._id,
					text: user.fullName,
					data: {
						profileImageUrl: user.profileImageUrl,
					},
				};
			}) :
			[];
	}, [organizationMembers]);

	const CustomHardBreak = HardBreak.extend({
		addKeyboardShortcuts() {
			return {
				'Shift-Enter': () => this.editor.commands.setHardBreak(),
			};
		},
	});

	const NoShiftEnter = Extension.create({
		name: 'no_new_line',
		addProseMirrorPlugins() {
			return [
				new Plugin({
					key: new PluginKey('eventHandler'),
					props: {
						handleKeyDown(_, e) {
							if (e.key === 'Enter' && e.shiftKey) {
								return true;
							}
						},
					},
				}),
			];
		},
	});

	return [
		StarterKit.configure({
			hardBreak: false,
			bulletList: {
				keepMarks: true,
				keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
			},
			orderedList: {
				keepMarks: true,
				keepAttributes: false, // TODO : Making this as `false` because marks are not preserved when I try to preserve attrs, awaiting a bit of help
			},
			heading: false,
		}),
		TextStyle,
		Link,
		CustomHardBreak,
		Placeholder.configure({
			placeholder: 'Write something ...',
		}),
		NoShiftEnter,
		Mention.configure({
			HTMLAttributes: {
				class: 'mention',
			},
			suggestion: {
				items({ query }) {
					return mentionablesRef.current
						.filter((mentionable) =>
							mentionable.text.toLowerCase().startsWith(query.toLowerCase())
						)
						.slice(0, 5);
				},
				render() {
					let component: any;
					let popup: any;

					return {
						onStart(props) {
							setShouldLoadMembers(true);

							component = new ReactRenderer(MentionList, {
								props,
								editor: props.editor,
							});

							if (!props.clientRect) {
								return;
							}

							// @ts-expect-error
							popup = tippy('body', {
								getReferenceClientRect: props.clientRect,
								appendTo: () => commentsState.container ?? document.body,
								content: component.element,
								showOnCreate: true,
								interactive: true,
								trigger: 'manual',
								placement: 'bottom-start',
								theme: 'none',
							});
						},

						onUpdate(props) {
							component.updateProps(props);

							if (!props.clientRect) {
								return;
							}

							popup[0].setProps({
								getReferenceClientRect: props.clientRect,
							});
						},

						onKeyDown(props) {
							if (props.event.key === 'Escape') {
								popup[0].hide();

								return true;
							}

							return component.ref?.onKeyDown(props);
						},

						onExit() {
							popup[0].destroy();
							component.destroy();
						},
					};
				},
			},
			renderLabel({ options, node }) {
				return `${options.suggestion.char}${node.attrs.label}`;
			},
		}),
	];
}
