// SPDX-FileCopyrightText: 2026 Antoni Szymański
// SPDX-License-Identifier: MPL-2.0

import type webpack from "webpack"

const config: webpack.Configuration = {
	mode: "production",
	output: {
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
			},
			{
				test: /\.css$/,
				type: "asset/source",
				use: "clean-css-loader",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".css"],
	},
	optimization: {
		chunkIds: "total-size",
		moduleIds: "size",
	},
	performance: {
		hints: false,
	},
}

export default config
