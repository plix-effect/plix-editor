const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    if (!env) env = {};
    const PRODUCTION = env.production === undefined ? false : env.production;
    // const SW_ENABLED = env.sw === undefined ? true : env.sw;

    const REPLACEMENTS = [
        // {search: '\\$WEBPACK_API_ADDRESS', replace:API_URL, flags: "g"},
        // {search: '\\$WEBPACK_ENABLE_SW', replace:String(SW_ENABLED), flags: "g"},
    ];

    return {
        devtool: 'source-map',
        mode: PRODUCTION ? 'production' : 'development',
        entry: {
            index: './src/index.tsx',
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                // Правило для .ts .tsx
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                // Правило подгрузки sass, scss, css
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: './style'
                            }
                        },
                        'css-loader',
                        'sass-loader'
                    ]
                },
                // Правило подставки $WEBPACK: переменных
                {
                    test: /(\.(sa|sc|c)ss|\.[tj]sx?)$/,
                    exclude: /node_modules/,
                    loader: 'string-replace-loader',
                    options: {
                        multiple: REPLACEMENTS
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "style/style-[id].css",
                chunkFilename: "style/style-[id].css"
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "./src/ui/assets/",
                        to: "./assets"
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                template: "./src/index.html",
                filename: "index.html",
                base: "/",
            })
        ]
    };
};