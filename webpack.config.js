var webpack = require('webpack');

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    entry: {
        index: './browser/index.js'
    },
    output: {
        filename: '[name].js'
    },
    node: {
        cluster: 'empty',
        fs: 'empty',
        tls: 'empty',
        repl: 'empty'
    },
    resolve: {
        modules: ['node_modules', 'dev'] // https://github.com/webpack/webpack/issues/2119#issuecomment-190285660
    },
    module: {
        loaders: [
            {test: /\.jsx?$/, exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/, loader: 'babel', query: {presets: ['react', 'es2015-without-strict']}},
            {test: /\.json$/, loader: 'json'}
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi)$/)
    ]
};
