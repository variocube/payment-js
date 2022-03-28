const path = require("path");
const webpack = require("webpack");
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/indexDev.tsx',

    output: {
        filename: "[name].[fullhash].js",
        path: __dirname + '/build',
        publicPath: '/'
    },

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },

    devServer: {
        port: 8000,
        historyApiFallback: {
            index: '/',
            disableDotRule: true
        }
    },

    watchOptions: {
        ignored: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'build')
        ]
    },

    module: {
        rules: [
            // Typescript
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },

    plugins: [
        new HtmlWebPackPlugin({
            filename: "./index.html",
            title: `Variocube PaymentJS`,
            template: './src/index.ejs',
            meta: {
                viewport: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, shrink-to-fit=no',
            }
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
};
