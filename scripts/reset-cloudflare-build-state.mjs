// Intentionally written with `var` and dynamic imports so duplicate file concatenation
// in stale build environments does not throw redeclaration syntax errors.
var fsModule = await import('node:fs');
var pathModule = await import('node:path');
var fs = fsModule.default ?? fsModule;
var path = pathModule.default ?? pathModule;

var projectRoot = process.cwd();
var wranglerStateDir = path.join(projectRoot, '.wrangler');
var legacyVibesdk2Dir = path.join(projectRoot, 'dist', 'vibesdk2');

var safeRemove = function (targetPath) {
	if (!fs.existsSync(targetPath)) {
		return false;
	}

	fs.rmSync(targetPath, { recursive: true, force: true });
	return true;
};

var main = function () {
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
};

main();
