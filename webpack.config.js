const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const production = process.env.NODE_ENV === "production";
let mode = "development";
let target = "web";

const plugins = [
	new CopyPlugin({
		patterns: [{ from: "src/img", to: "img" }],
	}),
	new ImageMinimizerPlugin({
		minimizerOptions: {
			plugins: [
				["mozjpeg", { quality: 30 }],
				["pngquant", { quality: [0.5, 0.5] }],
			],
		},
	}),
	new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
	new MiniCssExtractPlugin({
		filename: production ? "[name].[contenthash].css" : "[name].css",
	}),
	new HtmlWebpackPlugin({
		template: "./src/index.html",
		minify: {
			collapseWhitespace: production,
		},
	}),
];

if (production) {
	mode = "production";
	target = "browserslist";
}

module.exports = {
	mode: mode,

	entry: "./src/js/index.js",

	output: {
		filename: production ? "[name].[contenthash].js" : "[name].js",
		path: path.resolve(__dirname, "dist"),
		assetModuleFilename: "fonts/[hash][ext][query]",
	},

	module: {
		rules: [
			{
				test: /\.(s[ac]|c)ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					"css-loader",
					"postcss-loader",
					"resolve-url-loader",
					"sass-loader",
				],
			},
			{
				test: /\.(svg|png|jpeg|jpg|gif)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "img",
							publicPath: "img",
							emitFile: true,
						},
					},
				],
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						cacheDirectory: true,
					},
				},
			},
		],
	},

	optimization: {
		minimize: true,
		minimizer: [new CssMinimizerPlugin(), new TerserWebpackPlugin()],
	},

	plugins: plugins,

	target: target,

	devtool: "source-map",

	devServer: {
		contentBase: "./dist",
		hot: true,
		open: true,
		compress: true,
		port: 3000,
	},
};
