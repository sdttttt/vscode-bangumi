import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import { cleandir } from "rollup-plugin-cleandir";

const extensions = [".ts", ".js"];

export default {
	input: [
		"./src/extension.ts"
	],
	output: {
		file: "./dist/extension.js",
		format: "cjs"
	},
	plugins: [
		cleandir(["./dist"]),
		nodeResolve({
			extensions,
			modulesOnly: true
		}),
		babel({
			include: "src/**",
			extensions
		})
	],
};