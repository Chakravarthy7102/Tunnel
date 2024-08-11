/**
	@file
	This entry file can be run multiple times (e.g. in React strict mode), so it has to be idempotent.
*/

// Needed by esbuild
globalThis.React = require('react');
import { initializeTunnelToolbar } from '#utils/initialize.tsx';
import { isTunnelToolbarMounted, mountTunnelToolbar } from '#utils/mount.ts';
import './toolbar.css';

if (!(globalThis as any).__TUNNEL_TOOLBAR_INITIALIZED__) {
	(globalThis as any).__TUNNEL_TOOLBAR_INITIALIZED__ = true;

	initializeTunnelToolbar();
}

if (!isTunnelToolbarMounted()) {
	mountTunnelToolbar();
}
