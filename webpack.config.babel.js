import { join } from 'path'

const include = join(__dirname, 'src')

export default {
    entry: './src/index',
    output: {
        path: join(__dirname, 'dist'),
        libraryTarget: 'umd',
        library: 'MobiledgexClient',
    },
    devtool: 'source-map',
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader', include },
            { test: /\.json$/, use: 'json-loader', include },
        ]
    }
}