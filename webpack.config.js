/* eslint-disable @typescript-eslint/no-var-requires */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const path = require("path");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const ProgressPlugin = require("progress-bar-webpack-plugin");
const WebpackNotifierPlugin = require("webpack-notifier");
// 梁非凡
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const ForkTsCheckerConfig = {
	typescript: {
		enabled: true,
		profile: true
	},
	eslint: {
		enabled: true,
		files: './src/**/*.{ts,js}'
	}
};

/**@type {import('webpack').Configuration}*/
const config = {
	target: "node", // vscode插件运行在Node.js环境中 📖 -> https://webpack.js.org/configuration/node/
	
	entry: "./src/extension.ts", // 插件的入口文件 📖 -> https://webpack.js.org/configuration/entry-context/
	output: {
		// 打包好的文件储存在'dist'文件夹中 (请参考package.json), 📖 -> https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, "dist"),
		filename: "extension.js",
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]"
	},
	externals: {
		vscode: "commonjs vscode" // vscode-module是热更新的临时目录，所以要排除掉。 在这里添加其他不应该被webpack打包的文件, 📖 -> https://webpack.js.org/configuration/externals/
	},
	resolve: {
		// 支持读取TypeScript和JavaScript文件, 📖 -> https://github.com/TypeStrong/ts-loader
		extensions: [".ts", ".js"]
	},
	plugins: [
		new ProgressPlugin({width: 1000}),
		new ForkTsCheckerPlugin(ForkTsCheckerConfig),
		new WebpackNotifierPlugin({ title: "Webpacker", emoji: true }),
		new CleanWebpackPlugin({verbose: true }),
	],
	devtool: "source-map",
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						// loader: 'babel-loader',
						// options: {
						// 	presets: [
						// 		"@babel/preset-env",
						// 		"@babel/preset-typescript"
						// 	],
						// 	plugins: [
						// 		"@babel/plugin-proposal-class-properties",
						// 		"@babel/plugin-proposal-object-rest-spread"
						// 	]
						// }
						loader: "ts-loader",
					}
				]
			}
		]
	}
};

module.exports = config;