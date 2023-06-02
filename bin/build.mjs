import * as esbuild from 'esbuild';

/** @type esbuild.BuildOptions */
const sharedOptions = {
	entryPoints: ['src/index.ts'],
	bundle: true,
	minify: true,
	sourcemap: true,
	target: 'es2019',
	external: ['history', 'react', 'react-dom', 'tslib'],
};

await esbuild.build({
	...sharedOptions,
	format: 'cjs',
	outfile: 'dist/index.js',
});

await esbuild.build({
	...sharedOptions,
	format: 'esm',
	outfile: 'dist/index.mjs',
});
