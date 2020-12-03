// eslint-disable-next-line @typescript-eslint/no-var-requires
const { src, dest, watch, series } =  require("gulp");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProject } =  require( "gulp-typescript");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imagemin = require("gulp-imagemin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cssmin = require("gulp-clean-css");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clean = require("gulp-clean");

async function optimizeimgTask() {
	src("resources/*")
	.pipe(imagemin())
	.pipe(dest("resources"));

	src("Icon.png")
	.pipe(imagemin())
	.pipe(dest("."));
}

async function cleanTask() {
	src(["out","resources/mincss"])
	.pipe(clean())
}

async function optimizecssTask() {
	src("resources/css/*.css")
	.pipe(cssmin())
	.pipe(dest("resources/mincss"))
}

async function compileTask() {
	const tsconfig = createProject("tsconfig.json");
	const tsresult =  src("src/**/*.ts")
	.pipe(tsconfig());

	return tsresult.js.pipe(dest("out"));
}

exports.watchCompile = async () => {
	watch("src/**/*.ts", compileTask);
};

exports.clean = cleanTask;
exports.optimizeimg = optimizeimgTask
exports.optimizecss = optimizecssTask
exports.compile = compileTask
exports.default = series(optimizeimgTask, optimizecssTask, compileTask)