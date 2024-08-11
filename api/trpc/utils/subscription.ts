import type { Operation } from '@trpc/client';

export function splitLinkSubscriptionCondition(op: Operation) {
	return (
		// op.path === 'projectLivePreview.updateCursor' ||
		// op.path === 'projectLivePreview.updateSelection' ||
		op.type === 'subscription'
	);
}
