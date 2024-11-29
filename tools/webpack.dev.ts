import 'webpack-dev-server'
import * as path from 'path'
import * as webpack from 'webpack'
import { get as getCommonConfig } from './webpack.common'
import merge from 'webpack-merge'

export function get(): webpack.Configuration {
    return merge(getCommonConfig(), {
        devtool: 'source-map',
        mode: 'development',
        // resolve: {
        //     symlinks: true,
        //     alias: {
        //         vue: require.resolve('vue'),
        //     }
        // },
        devServer: {
            host: 'localhost',
            port: 8080,
            compress: true,
            hot: true,
        },
        output: {
            filename: '[name].[contenthash].js',
            publicPath: '/'
        }
    })
}

export default get()
