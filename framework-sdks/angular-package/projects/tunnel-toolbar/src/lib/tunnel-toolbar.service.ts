import { Inject, Injectable, Optional } from '@angular/core';
import { BRANCH, PROJECT_ID, RELEASE } from './tokens';

@Injectable({ providedIn: 'root' })
export class TunnelToolbarService {
	constructor(
		@Inject(PROJECT_ID) private projectId: string,
		@Optional() @Inject(BRANCH) private branch?: string,
		/** @internal */
		@Optional() @Inject(RELEASE) private release?: string,
	) {
		this.appendScript();
	}

	private appendScript(): void {
		const script = document.createElement('script');

		const src = this.release === undefined ?
			'https://tunnel.test/__tunnel/script.js' :
			this.release === 'staging' ?
			'https://staging.tunnel.dev/__tunnel/script.js' :
			'https://tunnel.dev/__tunnel/script.js';

		script.src = src;
		script.dataset['projectId'] = this.projectId;
		if (this.branch !== undefined) {
			script.dataset['branch'] = this.branch;
		}

		if (this.release !== undefined) {
			script.dataset['release'] = String(this.release);
		}

		script.async = true;

		document.body.append(script);
	}
}
