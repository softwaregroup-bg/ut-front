var webpack = require('webpack');
var path = require('path');

function isExternal(module) {
    var userRequest = module.userRequest;

    if (typeof userRequest !== 'string') {
        return false;
    }

    return userRequest.indexOf('node_modules') >= 0;
}

module.exports = (params) => {
    var entry = {};
    if (params.entryPoint instanceof Array) {
        entry = params.entryPoint.reduce((prev, item) => {
            prev[path.basename(item, '.js')] = item;
            return prev;
        }, {});
    } else if (typeof params.entryPoint === 'string') {
        entry[path.basename(params.entryPoint, '.js')] = params.entryPoint;
    }

    return {
        devtool: 'cheap-module-eval-source-map',
        entry,
        output: {
            filename: '[name].js',
            publicPath: '/static/lib/',
            path: params.outputPath
        },
        node: {
            cluster: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            repl: 'empty'
        },
        resolve: {
            modules: ['node_modules']
        },
        postcssImportConfigPaths: [params.configPath || '', params.themePath || ''],
        plugins: [
            new webpack.IgnorePlugin(
                /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request|dtrace\-provider)$/
            ),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                filename: `vendor.bundle.js`,
                minChunks: function(module) {
                    return isExternal(module);
                }})
        ],
        module: {
            loaders: [
                {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['url-loader?limit=10000&minetype=application/font-woff']},
                {test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['file-loader']},
                {test: /\.json$/, loaders: ['json-loader']},
                {test: /.*\.(gif|png|jpe?g|svg)$/i, loaders: ['url-loader?limit=30720000']},
                {test: /\.css$/, loaders: ['style-loader?sourceMap', 'css-loader?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]!postcss-loader']}
            ]
        }
    };
};
