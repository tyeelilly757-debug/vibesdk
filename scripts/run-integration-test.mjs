#!/usr/bin/env node
/**
 * Cross-platform runner for integration tests.
 * Sets VIBESDK_RUN_INTEGRATION_TESTS=1 and runs vitest.
 * Skips with exit 0 when VIBESDK_API_KEY is not set (e.g. local dev, CI without secrets).
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.VIBESDK_API_KEY || process.env.VIBESDK_INTEGRATION_API_KEY;
if (!apiKey) {
	console.log(
		'[skip] Integration tests require VIBESDK_API_KEY. Set it to run against a live instance.'
	);
	process.exit(0);
}

const vitestPath = join(__dirname, '..', 'node_modules', 'vitest', 'vitest.mjs');
const env = {
	...process.env,
	VIBESDK_RUN_INTEGRATION_TESTS: '1',
	VIBESDK_INTEGRATION_VIA_SCRIPT: '1',
};
const proc = spawn('node', [vitestPath, 'run', 'sdk/test/integration/integration.test.ts'], {
	stdio: 'inherit',
	env,
	cwd: join(__dirname, '..'),
});
proc.on('exit', (code) => process.exit(code ?? 0));
