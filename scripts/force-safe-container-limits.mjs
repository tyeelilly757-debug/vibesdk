import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const sourceWranglerPath = path.join(projectRoot, 'wrangler.jsonc');
const deployConfigPath = path.join(projectRoot, '.wrangler', 'deploy', 'config.json');

function getExpectedWorkerName() {
	try {
		const sourceConfigRaw = fs.readFileSync(sourceWranglerPath, 'utf8');
		const match = sourceConfigRaw.match(/"name"\s*:\s*"([^"]+)"/);
		if (match?.[1]) {
			return match[1];
		}
	} catch {
		// Fall back to default when source config is not readable.
	}

	return 'vibesdk';
}

function getGeneratedWranglerPaths() {
	const distPath = path.join(projectRoot, 'dist');
	if (!fs.existsSync(distPath)) {
		return [];
	}

	const entries = fs.readdirSync(distPath, { withFileTypes: true });
	const paths = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const candidate = path.join(distPath, entry.name, 'wrangler.json');
		if (fs.existsSync(candidate)) {
			paths.push(candidate);
		}
	}

	return paths;
}

function stripRouteConfig(config) {
	let patched = false;

	function visit(node) {
		if (!node || typeof node !== 'object') {
			return;
		}

		if (Array.isArray(node)) {
			for (const item of node) {
				visit(item);
			}
			return;
		}

		if (Object.prototype.hasOwnProperty.call(node, 'routes')) {
			delete node.routes;
			patched = true;
		}

		if (Object.prototype.hasOwnProperty.call(node, 'route')) {
			delete node.route;
			patched = true;
		}

		for (const value of Object.values(node)) {
			visit(value);
		}
	}

	visit(config);

	if (Object.prototype.hasOwnProperty.call(config, 'routes')) {
		delete config.routes;
		patched = true;
	}

	if (Object.prototype.hasOwnProperty.call(config, 'route')) {
		delete config.route;
		patched = true;
	}

	if (config.workers_dev !== true) {
		config.workers_dev = true;
		patched = true;
	}

	if (config.preview_urls !== true) {
		config.preview_urls = true;
		patched = true;
	}

	return patched;
}

function patchJsonFile(filePath, patcher, logPrefix) {
	if (!fs.existsSync(filePath)) {
		console.log(`${logPrefix} Skipping: ${filePath} not found`);
		return false;
	}

	const raw = fs.readFileSync(filePath, 'utf8');
	let config;
	try {
		config = JSON.parse(raw);
	} catch (error) {
		console.error(`${logPrefix} Failed to parse JSON: ${filePath}`);
		throw error;
	}

	const patched = patcher(config);
	if (patched) {
		fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
		console.log(`${logPrefix} Patched ${filePath}`);
	} else {
		console.log(`${logPrefix} No changes needed for ${filePath}`);
	}

	return patched;
}

function main() {
	const expectedWorkerName = getExpectedWorkerName();
	const generatedWranglerPaths = getGeneratedWranglerPaths();

	if (generatedWranglerPaths.length === 0) {
		console.log('[force-safe-container-limits] Skipping: no generated dist/*/wrangler.json found');
	}

	for (const generatedWranglerPath of generatedWranglerPaths) {
		patchJsonFile(
			generatedWranglerPath,
			(config) => {
			let patched = false;
			if (!Array.isArray(config.containers)) {
				console.log('[force-safe-container-limits] No containers array found in generated wrangler config');
			} else {
				for (const container of config.containers) {
					if (container?.class_name === 'UserAppSandboxService' && container.max_instances !== 1) {
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

			// Force generated configs to keep the canonical worker name.
			if (config.name !== expectedWorkerName) {
				config.name = expectedWorkerName;
				patched = true;
			}

			// Keep deployment on workers.dev to avoid route API failures.
			if (stripRouteConfig(config)) {
				patched = true;
			}

			return patched;
		},
		'[force-safe-container-limits]',
	);
	}

	patchJsonFile(
		deployConfigPath,
		(config) => {
			let patched = false;
			if (stripRouteConfig(config)) {
				patched = true;
			}
			if (config.name && config.name !== expectedWorkerName) {
				config.name = expectedWorkerName;
				patched = true;
			}
			return patched;
		},
		'[force-safe-container-limits]',
	);
}

main();
