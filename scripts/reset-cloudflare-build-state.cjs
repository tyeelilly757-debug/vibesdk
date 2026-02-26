var fs = require('node:fs');
var path = require('node:path');

var projectRoot = process.cwd();
var wranglerStateDir = path.join(projectRoot, '.wrangler');
var legacyVibesdk2Dir = path.join(projectRoot, 'dist', 'vibesdk2');

function safeRemove(targetPath) {
	if (!fs.existsSync(targetPath)) {
		return false;
	}
	fs.rmSync(targetPath, { recursive: true, force: true });
	return true;
}

function main() {
	var removedWranglerState = safeRemove(wranglerStateDir);
	var removedLegacyOutput = safeRemove(legacyVibesdk2Dir);

	if (removedWranglerState) {
		console.log('[reset-cloudflare-build-state] Removed stale .wrangler state');
	}
	if (removedLegacyOutput) {
		console.log('[reset-cloudflare-build-state] Removed stale dist/vibesdk2 output');
	}
	if (!removedWranglerState && !removedLegacyOutput) {
		console.log('[reset-cloudflare-build-state] No stale Cloudflare build state found');
	}
}

main();
