import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const generatedWranglerPath = path.join(projectRoot, 'dist', 'vibesdk', 'wrangler.json');

function main() {
	if (!fs.existsSync(generatedWranglerPath)) {
		console.log(`[force-safe-container-limits] Skipping: ${generatedWranglerPath} not found`);
		return;
	}

	const raw = fs.readFileSync(generatedWranglerPath, 'utf8');
	let config;
	try {
		config = JSON.parse(raw);
	} catch (error) {
		console.error('[force-safe-container-limits] Failed to parse generated wrangler.json');
		throw error;
	}

	if (!Array.isArray(config.containers)) {
		console.log('[force-safe-container-limits] No containers array found; nothing to patch');
		return;
	}

	let patched = false;
	for (const container of config.containers) {
		if (container?.class_name === 'UserAppSandboxService') {
			if (container.max_instances !== 1) {
				container.max_instances = 1;
				patched = true;
			}
		}
	}

	config.vars = config.vars || {};
	if (config.vars.MAX_SANDBOX_INSTANCES !== '1') {
		config.vars.MAX_SANDBOX_INSTANCES = '1';
		patched = true;
	}

	if (patched) {
		fs.writeFileSync(generatedWranglerPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
		console.log('[force-safe-container-limits] Patched generated wrangler.json with safe limits');
	} else {
		console.log('[force-safe-container-limits] Generated wrangler.json already safe');
	}
}

main();
