import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const wranglerStateDir = path.join(projectRoot, '.wrangler');
const legacyVibesdk2Dir = path.join(projectRoot, 'dist', 'vibesdk2');

function safeRemove(targetPath) {
	if (!fs.existsSync(targetPath)) {
		return false;
	}

	fs.rmSync(targetPath, { recursive: true, force: true });
	return true;
}

function main() {
	const removedWranglerState = safeRemove(wranglerStateDir);
	const removedLegacyOutput = safeRemove(legacyVibesdk2Dir);

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
