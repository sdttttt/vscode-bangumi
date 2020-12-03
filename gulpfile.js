// eslint-disable-next-line @typescript-eslint/no-var-requires
const { src, dest } =  require("gulp");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProject } =  require( "gulp-typescript");

async function defaultTask() {
	const tsconfig = createProject("tsconfig.json");
	const tsresult =  src("src/**/*.ts")
	.pipe(tsconfig());

	return tsresult.js.pipe(dest("out"))
}

exports.default = defaultTask;