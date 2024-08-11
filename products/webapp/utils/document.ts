'use client';

export function useDocumentBody(): HTMLElement | null {
	// eslint-disable-next-line no-restricted-globals -- Guarded
	return typeof document === 'undefined' ? null : document.body;
}
