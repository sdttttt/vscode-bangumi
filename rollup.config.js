const { nodeResolve } = require('@rollup/plugin-node-resolve');
const ts = require("rollup-plugin-ts");
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const { terser } = require("rollup-plugin-terser");
const progressbar = require('rollup-plugin-progress');

/**
 * @type {import("rollup").RollupOptions}
 */
module.exports = {
	input: './src/extension.ts',
	output: {
		file: './dist/extension.js',
		format: 'cjs',
		sourcemap: false,
		banner: `/* 很感谢你使用BangumiOpen, 祝你工作愉快!  */`
	},

	external: [
		'vscode'
	],

	plugins: [
		commonjs(),
		nodeResolve({
			preferBuiltins: true
		}),
		json(),
		ts(),
		terser(),
		progressbar({
			clearLine: false
		}),
	]
};