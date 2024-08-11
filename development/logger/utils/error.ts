import { APP_ENV } from '@-/env/app';
import chalk from 'chalk';

export function getErrorMessage(error: unknown): string {
	if (APP_ENV === 'development') {
		if (typeof error === 'object' && error !== null && 'message' in error) {
			return String(error.message);
		} else {
			// eslint-disable-next-line unicorn/error-message -- Creating an error solely for the `stack` property; no message needed
			return `${String(error)}\n${chalk.dim(new Error().stack ?? '')}`;
		}
	} else {
		if (typeof error === 'object' && error !== null && 'message' in error) {
			return String(error.message);
		} else {
			return String(error);
		}
	}
}
