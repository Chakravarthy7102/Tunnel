import { env } from '@-/env';
import onetime from 'onetime';
import OpenAI from 'openai';

export const getOpenAiClient = onetime(() => {
	const openai = new OpenAI({
		apiKey: env('OPENAI_API_KEY'),
	});

	const complete = async (options: { prompt: string }): Promise<string> => {
		const completion = await openai.chat.completions.create({
			messages: [{ role: 'user', content: options.prompt }],
			model: 'gpt-3.5-turbo',
		});

		return completion.choices[0]?.message.content ?? '';
	};

	return {
		client: openai,
		complete,
	};
});
