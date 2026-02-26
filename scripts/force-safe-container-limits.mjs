import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const generatedWranglerPath = path.join(projectRoot, 'dist', 'vibesdk', 'wrangler.json');
const deployConfigPath = path.join(projectRoot, '.wrangler', 'deploy', 'config.json');

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

			// Keep deployment on workers.dev to avoid route API failures.
			if (stripRouteConfig(config)) {
				patched = true;
			}

			return patched;
		},
		'[force-safe-container-limits]',
	);

	patchJsonFile(
		deployConfigPath,
		(config) => stripRouteConfig(config),
		'[force-safe-container-limits]',
	);
}

main();
