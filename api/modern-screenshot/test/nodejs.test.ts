import { domToForeignObjectSvg } from '#utils/converts/dom-to-foreign-object-svg.ts';
import { Window } from 'happy-dom';
import { describe, expect, test } from 'vitest';

describe('use happy-dom in nodejs', async () => {
	test('dom to svg', async () => {
		const window = new Window();
		const { document } = window;
		document.write(`
<html>
  <body>
    <div style="display: flex; justify-content: center; align-items: center;">
      <span>test1</span>
      <span>test2</span>
    </div>
  </body>
</html>
`);
		const svg = await domToForeignObjectSvg(document.body as unknown as Node);
		// eslint-disable-next-line @typescript-eslint/no-base-to-string -- todo
		expect(svg.toString()).not.toBeNull();
	});
});
