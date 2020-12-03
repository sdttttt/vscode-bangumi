// eslint-disable-next-line @typescript-eslint/no-var-requires
const { src, dest, watch, series } =  require("gulp");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProject } =  require( "gulp-typescript");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const imagemin = require("gulp-imagemin");

async function optimizeimgTask() {
	src("resources/*")
	.pipe(imagemin())
	.pipe(dest("resources"));

	src("Icon.png")
	.pipe(imagemin())
	.pipe(dest("."));
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

exports.optimizeimg = optimizeimgTask
exports.compile = compileTask