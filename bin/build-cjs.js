#!/usr/bin/env node
const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const sharedConfig = {
  entryPoints: ['./src/index.ts'],
  platform: 'node',
  sourcemap: true,
  bundle: true,
  external: ['history', 'react'],
  target: ['node12'],
};

const indexContent = `'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./yarr.cjs.production.min.js')
} else {
  module.exports = require('./yarr.cjs.development.js')
}
`;

(async () => {
  try {
    await Promise.all([
      esbuild.build({
        ...sharedConfig,
        outfile: './dist/cjs/yarr.cjs.production.min.js',
        minify: true,
      }),

      esbuild.build({
        ...sharedConfig,
        outfile: './dist/cjs/yarr.cjs.development.js',
      }),
    ]);
  } catch (error) {
    console.log('An error occured when building the bundled cjs files');
    throw error;
  }

  try {
    await fs.writeFile(
      path.resolve(__dirname, '../dist/cjs', 'index.js'),
      indexContent
    );
  } catch (error) {
    console.log('There was an error writing the cjs index file');
    console.log(error);
    process.exit(1);
  }

  process.exit(0);
})();
