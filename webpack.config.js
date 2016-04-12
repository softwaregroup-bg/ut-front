var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = {
    // devtool: 'eval-inline-source-map',
    entry: {
        index: './browser/index.js'
    },
    output: {
        filename: '[name].js'
    },
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
    watch: true,
    module: {
        loaders: [
            {test: /\.jsx?$/, exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/, loader: 'babel', query: {presets: ['react', 'es2015-without-strict', 'stage-0']}},
            {test: /\.json$/, loader: 'json'},
            {test: /\.css$/, loaders: ['style?sourceMap', 'css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]']}
        ]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({filename: 'bundle.js.map', moduleFilenameTemplate: '[absolute-resource-path]', fallbackModuleFilenameTemplate: '[absolute-resource-path]'}),
        new webpack.optimize.DedupePlugin(),
        new webpack.IgnorePlugin(/^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/),
        new BellOnBundlerErrorPlugin()
    ]
};
