/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/w40k.ts',
    //mode: 'development', //none/development/production
    optimization: {
        usedExports: true
    },
    output: {
        filename: "w40k.js",
        //filename: '[name].[id].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        // disable type checker - we will use it in fork plugin
                        transpileOnly: true
                    }
                }
            },
            {
                test: /\.(scss|sass|css)$/,
                use: [
                    process.env.NODE_ENV !== 'production'
                        ? 'style-loader'
                        : MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            //filename: '[name].[contenthash].css',
            filename: 'w40k.css',
            chunkFilename: '[id].css'
        }),
        new CleanWebpackPlugin(),// to clean dist folder each time when webpack does a new build.
        new HtmlWebpackPlugin({ // to generate w40k.html file from a template with scripts and styles tags.
            template: './src/w40k.html',
            filename: 'w40k.html'
        }),
        new ForkTsCheckerWebpackPlugin(), // this plugin allows us to check typescript typings as a separate process. It will improve build performance
        new CopyPlugin({ // This plugin gives us the ability to copy the assets folder with its content to the dist folder
            patterns: [{from: 'src/assets', to: 'assets'}]
        }),
        new ESLintPlugin({
            extensions: ['.tsx', '.ts', '.js'],
            exclude: 'node_modules',
            context: 'src'
        })
    ]
};