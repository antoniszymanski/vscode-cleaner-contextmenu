// SPDX-FileCopyrightText: 2026 Antoni Szymański
// SPDX-License-Identifier: MPL-2.0

import { defineConfig } from "@rspack/cli"
import { TsCheckerRspackPlugin } from "ts-checker-rspack-plugin"

export default defineConfig({
	mode: "production",
	target: "browserslist:electron",
	output: {
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "builtin:swc-loader",
			},
			{
				test: /\.css$/,
				loader: "clean-css-loader",
				type: "asset/source",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".css"],
	},
	optimization: {
		chunkIds: "total-size",
	},
	plugins: [new TsCheckerRspackPlugin()],
	performance: {
		hints: false,
	},
})
