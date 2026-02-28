import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Only enable integration via our script (avoids .dev.vars accidentally enabling it)
const runIntegrationTests =
	process.env.VIBESDK_RUN_INTEGRATION_TESTS === '1' &&
	process.env.VIBESDK_INTEGRATION_VIA_SCRIPT === '1';

export default defineWorkersConfig({
  resolve: {
    alias: {
      'bun:test': 'vitest',
      ...(runIntegrationTests
        ? { '@cf-vibesdk/sdk': resolve(__dirname, 'sdk/src/index.ts') }
        : {}),
    },
  },
  test: {
    globals: true,
    pool: '@cloudflare/vitest-pool-workers',
    deps: {
      optimizer: {
        ssr: {
          enabled: true,
          include: [
            '@cloudflare/containers',
            '@cloudflare/sandbox',
            '@babel/traverse',
            '@babel/types',
          ],
        },
      },
    },
    poolOptions: {
      workers: {
        main: './test/worker-entry.ts',
        wrangler: { configPath: './wrangler.test.jsonc' },
        miniflare: {
          compatibilityDate: '2024-12-12',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.git/**',
      '**/worker/api/routes/**',
      '**/test/worker-entry.ts',
      '**/container/monitor-cli.test.ts',
      '**/cf-git/**',
      // SDK tests run with bun test; when integration flag set, include sdk/test/integration only
      ...(runIntegrationTests
        ? ['**/sdk/test/!(integration)/**']
        : ['**/sdk/test/**']),
    ],
  },
});