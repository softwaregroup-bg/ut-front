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
    module: {
        loaders: [
            {test: /\.jsx?$/, exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/, loader: 'babel', query: {presets: ['react', 'es2015-without-strict']}},
            {test: /\.json$/, loader: 'json'}
        ]
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({filename: 'bundle.js.map', moduleFilenameTemplate: '[absolute-resource-path]', fallbackModuleFilenameTemplate: '[absolute-resource-path]'}),
        new webpack.IgnorePlugin(/^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/),
        new BellOnBundlerErrorPlugin()
    ]
};
