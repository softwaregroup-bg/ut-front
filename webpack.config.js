var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = function(params, hotReload) {
    return {
        devtool: 'eval-inline-source-map',
        entry: {
            bundle: [
                'babel-polyfill', // ie8 >= support
                params.entryPoint
            ]
        },
        output: {
            filename: '[name].js',
            path: params.outputPath
        },
        name: 'browser',
        node: {
            cluster: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            repl: 'empty'
        },
        resolve: {
            modules: ['node_modules', 'dev'] // https://github.com/webpack/webpack/issues/2119#issuecomment-190285660
        },
        bail: true,
        module: {
            loaders: [{
                test: /\.jsx?$/,
                exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-0', 'react'].concat(hotReload ? ['react-hmre'] : []),
                    cacheDirectory: true
                }
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&minetype=application/font-woff'
            }, {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            }, {
                test: /\.json$/,
                loader: 'json'
            }, {
                test: /.*\.(gif|png|jpe?g|svg)$/i,
                loaders: ['url-loader?limit=30720000',
                    'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
                ]
            }, {
                test: /\.css$/,
                loaders: ['style?sourceMap', 'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]']
            }]
        },
        plugins: [
            new webpack.SourceMapDevToolPlugin({
                filename: 'bundle.js.map',
                moduleFilenameTemplate: '[absolute-resource-path]',
                fallbackModuleFilenameTemplate: '[absolute-resource-path]'
            }),
            // new webpack.optimize.DedupePlugin(),
            new webpack.IgnorePlugin(
                /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/
            ),
            new BellOnBundlerErrorPlugin()
        ]
    };
};
