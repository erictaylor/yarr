import * as esbuild from 'esbuild';

/** @type esbuild.BuildOptions */
const sharedOptions = {
	bundle: true,
	entryPoints: ['src/index.ts'],
	external: ['history', 'react', 'react-dom', 'tslib'],
	minify: true,
	sourcemap: true,
	target: 'es2019',
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
