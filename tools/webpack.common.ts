import * as path from 'path'
import * as webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { findParentFolderPath } from '../scripts/node-utils'
import { VueLoaderPlugin } from 'vue-loader'
export const PackagePath = path.resolve(__dirname, '..')
// export const PackagesPath = findParentFolderPath(__dirname, 'packages')
export const SourcePath = path.resolve(PackagePath, 'src')
export const htmlPath = path.resolve(PackagePath, 'public')
// export const DevPath = path.resolve(PackagePath, 'dev')
// export const TsConfigPath = path.resolve(SourcePath, 'tsconfig.build.es.json')
// export const OutputPath = path.resolve(PackagePath, 'dist')
export function get(): webpack.Configuration {
    return {
        entry: './main.ts',
        context: SourcePath,
        plugins: [
            new HtmlWebpackPlugin({
                title: '阿伟的后花园',
                inject: true,
                template: path.join(htmlPath, 'index.html'),
                minify: {
                    removeComments: false,
                }
            }),
            new VueLoaderPlugin()
        ],
        module: {
            rules: [
                {
                    test: /\.bin$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'bins/[hash][ext][query]',
                    }
                },
                {
                    test: /\.(hdr)$/,
                    use: 'file-loader'
                },
                {
                    test: /\.vue$/,
                    use: 'vue-loader',
                },
                {
                    test: /\.(png|svg|jpe?g|gif|webp)$/,
                    type: 'asset',
                    generator: {
                        filename: 'bins/[hash][ext][query]',
                    }
                },
                {
                    test: /\.(less|css)$/,
                    use: [
                        'vue-style-loader',
                        'css-loader',
                        'less-loader'
                    ]
                },
                {
                    test: /\.(t|j)s$/,
                    use: 'ts-loader'
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.vue'],
            fallback: {
                zlib: false,
                module: false,
            }
        },
    }
}

export default get()