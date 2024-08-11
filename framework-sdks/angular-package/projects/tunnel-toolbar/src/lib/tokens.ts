import { InjectionToken } from '@angular/core';

export const PROJECT_ID = new InjectionToken<string>('project-id');
export const BRANCH = new InjectionToken<string>('branch');

/** @internal */
export const RELEASE = new InjectionToken<string>('release');
