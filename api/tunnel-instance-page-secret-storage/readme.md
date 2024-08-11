# @-/tunnel-instance-page-secret-storage

Handles storing secrets on a tunnel instance page. From a page loaded via Tunnel's `<script>` tag, the storage uses `window.localStorage` and otherwise the page's cookies.
