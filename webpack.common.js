// const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
// const pjson = require('./package-lib.json');

// const getEffects = require('./webpack/get-effects');
// const effects = getEffects(path.resolve(__dirname, 'src/effects/'));

const prepare = require('./webpack/prepare.js');
prepare();

// console.log("EFFECT", effects);

module.exports = (env) => {
    // stylesOptions =  {
    //     sourceMap: process.env.NODE_ENV === 'dev',
    //     modules: true,
    //     importLoaders: 1,
    //     exportOnlyLocals: true,
    //     localIdentName:   process.env.NODE_ENV === 'dev'
    //         ? '[name]-[local]'
    //         : '[hash:base64:5]',
    //     namedExport: false,     // Disable transform to CamelCase from dashed-style
    // };

    process.noDeprecation = true;

    return {
        target: 'web',     // compile with or without webpackJsonp

        entry: {
            'eastereggs': path.resolve(__dirname, 'src', 'index.ts'),
            // ...effects
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
            library: 'eastereggs',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            publicPath: '/',                // Путь относительно которого загружаются ресурсы из бандла
        },
        optimization: {
            // runtimeChunk: true,         // exclude webpackBootstrap
            // splitChunks: {
            //     chunks: 'async',
            // }
        },

        module: {
            rules: [{
                test: /\.ts$/,
                use: [{
                    loader: 'ts-loader',
                }],
                exclude: /node_modules/
            }, {
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
                use: [{
                    loader: 'babel-loader',
                    options: {
                        plugins: ['syntax-dynamic-import'],
                        presets: [[
                            '@babel/preset-env',
                            { modules: false }
                        ]]
                    },
                }],
            }, {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: process.env.NODE_ENV === 'development',
                        },
                    },
                    'css-loader',
                    'postcss-loader',
                    'sass-loader',
                ],
            }, {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attributes: {
                            list: [
                                // All default supported tags and attributes
                                '...',
                                {
                                    tag: 'img',
                                    attribute: 'data-src',
                                    type: 'src',
                                },
                                {
                                    tag: 'img',
                                    attribute: 'data-srcset',
                                    type: 'srcset',
                                },
                            ],
                            root: '.'
                        }
                    }
                }
            }, {
                test: /\.(svg|woff|woff2|ttf|eot|otf)([\?]?.*)$/,
                loader: 'file-loader',
                options: {
                    name: 'assets/fonts/[name].[ext]'
                }
            }]
        },
        resolveLoader: {
            modules: [
                path.join(__dirname, 'node_modules')
            ]
        },
        resolve: {
            modules: [
                path.join(__dirname, 'node_modules')
            ],
            extensions: ['.ts', '.js']
        },
        devServer: {
            contentBase: 'dist',
            compress: true,
            port: 3000
        },
        plugins: [
            new CleanWebpackPlugin({
                root: process.cwd(),
                verbose: true,
                dry: false,
                cleanOnceBeforeBuildPatterns: ["**/*", "!package.json"],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    // {
                    //     from: 'src/index.html',
                    //     to: './index.html'
                    // },
                    {
                        from: 'src/assets/**/*',
                        to: './assets',
                        transformPath(targetPath, absolutePath) {
                            return targetPath.replace(`src${path.sep}assets`, '');
                        }
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                template: 'src/index.html',
                minify: {
                    collapseWhitespace: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                }
            }),
            new MiniCssExtractPlugin({
                filename: 'style-[hash].css'
            }),
            new ESLintPlugin({})
            // new webpack.DefinePlugin({
            //     __VERSION__: JSON.stringify(pjson.version)
            // })
        ]
    }
};
