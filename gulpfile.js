// eslint-disable-next-line @typescript-eslint/no-var-requires
const Webpack = require("webpack");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rollup = require('rollup');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rollupConfig = require('./rollup.config');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { src, dest, watch, series, parallel } = require("gulp");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProject } = require("gulp-typescript");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imagemin = require("gulp-imagemin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cssmin = require("gulp-clean-css");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clean = require("gulp-clean");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const gulpWebpack = require("webpack-stream");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notify = require("gulp-notify");

async function optimizeimgTask() {
	src("resources/*")
		.pipe(imagemin())
		.pipe(dest("resources"));

	src("Icon.png")
		.pipe(imagemin())
		.pipe(dest("."));
}

async function cleanTask() {
	src(["out", "resources/mincss"])
		.pipe(clean())
}

async function optimizecssTask() {
	src("resources/css/*.css")
		.pipe(cssmin())
		.pipe(dest("resources/mincss"))
}

async function compileTask() {
	const tsconfig = createProject("tsconfig.json");
	const tsresult = src("src/**/*.ts")
		.pipe(tsconfig());

	return tsresult.js.pipe(dest("out"));
}

async function packingTask() {
	//return src("./src/extension.ts")
	//// eslint-disable-next-line @typescript-eslint/no-var-requires
	//.pipe(gulpWebpack( 
	//	{
	//	...require("./webpack.config.js"),
	//	mode: "development",
	//	devtool: "inline-source-map",
	//	}
	//	, Webpack))
	//.pipe(notify("Packing done!"))
	//.pipe(dest("./dist"));

	const bundle = await rollup.rollup({
		...rollupConfig
	});


	await bundle.write({
		...rollupConfig.output, sourcemap: true
	});
}

async function packageTask() {
	//return src("./src/extension.ts")
	//	.pipe(gulpWebpack(
	//		{
	//			...require("./webpack.config.js"),
	//			mode: "production"
	//		}
	//		, Webpack))
	//	.pipe(dest("./dist"));


	const bundle = await rollup.rollup({
		...rollupConfig
	});


	await bundle.write({
		...rollupConfig.output, sourcemap: false
	});
}

const watchCompile = async () => {
	watch("src/**/*.ts", compileTask);
};

const watchPacking = async () => {
	watch("src/**/*.ts", packingTask);
}

exports.clean = cleanTask;
exports.optimizeimg = optimizeimgTask
exports.optimizecss = optimizecssTask
exports.compile = compileTask
exports.watch = parallel(watchCompile)
exports.default = series(optimizeimgTask, optimizecssTask, compileTask)
exports.publish = series(optimizeimgTask, optimizecssTask, compileTask, packageTask);
