var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = function(params) {
    return {
        devtool: 'eval-inline-source-map',
        entry: {
            bundle: ['babel-polyfill', params.entryPoint]
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
            loaders: [
                {test: /\.jsx?$/, exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/, loaders: ['babel?{presets: [\'react\', \'es2015-without-strict\', \'stage-0\']}']},
                {test: /\.json$/, loader: 'json'},
                {test: /.*\.(gif|png|jpe?g|svg)$/i, loaders: ['file?hash=sha512&digest=hex&name=[hash].[ext]', 'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}']},
                {test: /\.css$/, loaders: ['style?sourceMap', 'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]']}
            ]
        },
        plugins: [
            new webpack.SourceMapDevToolPlugin({filename: 'bundle.js.map', moduleFilenameTemplate: '[absolute-resource-path]', fallbackModuleFilenameTemplate: '[absolute-resource-path]'}),
            new webpack.IgnorePlugin(/^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/),
            new BellOnBundlerErrorPlugin()
        ]
    };
};

