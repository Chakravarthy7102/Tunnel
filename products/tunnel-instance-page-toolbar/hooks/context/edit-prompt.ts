import type { PageToolbarContext } from '#types';
import type { HostEnvironmentType } from '@-/host-environment';
// import type { ChatCompletionRequestMessage } from 'openai';

type ChatCompletionRequestMessage = any;

const gitDiffMessage: ChatCompletionRequestMessage = {
	role: 'system',
	content:
		`I need to create a git diff based on context in my code base, as well as a focused stateshot of a component I would like to make frontend changes to. I need you to respond with the result of the changes that I can directly run "git apply" on, in any directory on my computer, and change the file to your suggestion. Only respond in json format, with the structure below. Make sure to include the file name to apply the diff for, it will not work without it.

	{
		gitDiff: string
	}`,
};

export function useContextEditPrompt({
	context,
}: {
	context: PageToolbarContext<{
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
	}>;
}) {
	const addEditMessage = ({
		role,
		input,
	}: {
		role: 'assistant' | 'user' | 'system';
		input: string;
	}) => {
		context.store.setState((state) => ({
			...state,
			editPrompt: {
				...state.editPrompt,
				messages: [
					...state.editPrompt.messages,
					{
						role,
						content: input,
					},
				],
			},
		}));
	};

	const addEditPromptFile = ({
		fileName,
		fileContents,
	}: {
		fileName: string;
		fileContents: string;
	}) => {
		context.store.setState((state) => ({
			...state,
			editPrompt: {
				...state.editPrompt,
				context: [
					...state.editPrompt.context,
					{
						fileName,
						fileContents,
					},
				],
			},
		}));
	};

	const clearEditPrompt = () => {
		context.store.setState({
			editPrompt: {
				context: [],
				messages: [gitDiffMessage],
			},
		});
	};

	return {
		addEditMessage,
		addEditPromptFile,
		clearEditPrompt,
	};
}
