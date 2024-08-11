import { getSimiloXpathForElement } from '#utils/xpath.ts';
import { RobulaPlus } from '@-/robula-plus';

export function runSpeedBenchmarking(
	document: Document,
	maxElementsPerTag = 10,
): void {
	const tagWhitelist = new Set([
		'div',
		'p',
		'a',
		'img',
		'span',
		'button',
	]);
	const tags = [
		...new Set(
			[...document.getElementsByTagName('*')].map((el) =>
				el.tagName.toLowerCase()
			).filter((tag) => tagWhitelist.has(tag)),
		),
	];

	const benchmarkResults: {
		tag: string;
		averageTime: number;
		robulaAverageTime: number;
		numberItems: number;
	}[] = [];

	const robulaPlus = new RobulaPlus();

	for (const tag of tags) {
		const elements = [...document.getElementsByTagName(tag)].slice(
			0,
			maxElementsPerTag,
		);

		const times: number[] = [];
		const robulaTimes: number[] = [];

		for (const element of elements) {
			const startTime = performance.now();
			getSimiloXpathForElement(element, document);
			const endTime = performance.now();
			const elapsedTime = endTime - startTime;
			times.push(elapsedTime);
		}

		for (const element of elements) {
			const startTime = performance.now();
			robulaPlus.getRobustXPath(element, document);
			const endTime = performance.now();
			const elapsedTime = endTime - startTime;
			robulaTimes.push(elapsedTime);
		}

		const averageTime = times.reduce((sum, time) => sum + time, 0) /
			times.length;
		const robulaAverageTime = robulaTimes.reduce((sum, time) => sum + time, 0) /
			robulaTimes.length;
		benchmarkResults.push({
			tag,
			averageTime,
			robulaAverageTime,
			numberItems: elements.length,
		});
	}

	// Display the benchmark results in a table format
	// eslint-disable-next-line no-console -- Used for benchmarking
	console.table(benchmarkResults);
}
