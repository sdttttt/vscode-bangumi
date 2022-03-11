const { nodeResolve } = require('@rollup/plugin-node-resolve');
const ts = require("rollup-plugin-ts");
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const { terser } = require("rollup-plugin-terser");
const progressbar = require('rollup-plugin-progress');
module.exports = {
	input: './src/extension.ts',
	output: {
		file: './dist/extension.js',
		format: 'cjs',
		sourcemap: false
	},

	external: [
		'vscode'
	],

	plugins: [
		nodeResolve({
			preferBuiltins: true
		}),
		commonjs(),
		json(),
		ts(),
		terser(),
		progressbar({
			clearLine: false
		}),
	]
};