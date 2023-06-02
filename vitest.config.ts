import path from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(() => {
	return {
		base: '',
		test: {
			alias: {
				'@': path.resolve(__dirname, './src/'),
			},
			clearMocks: true,
			coverage: {
				exclude: [
					'src/**/*.stories.tsx',
					'src/**/*.snap',
					'src/typings/**',
					'src/test/**/*',
					'src/**/__fixtures__/**',
					'tests/**/*',
				],
				include: ['src/**'],
				// TODO: Up this value once we have a chance to increase coverage.
				lines: 93,
				provider: 'istanbul',
				reporters: ['text-summary', 'lcov'],
			},
			environment: 'jsdom',
			environmentOptions: {
				jsdom: {
					url: 'http://localhost',
				},
			},
			exclude: [...configDefaults.exclude, 'tests/**/*'],
			setupFiles: ['./vitest.setup.ts'],
		},
	};
});
