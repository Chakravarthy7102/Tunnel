import { env } from '@-/env';
import LoopsClient from 'loops';

export const getLoops = () => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
	const Loops = LoopsClient.default ?? LoopsClient;
	const loopsClient = new Loops(
		env('LOOPS_API_KEY'),
	);

	return loopsClient;
};
