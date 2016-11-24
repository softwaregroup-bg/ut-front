var webpack = require('webpack');
var path = require('path');

module.exports = (params) => {
    var sourceDir = path.dirname(require.main.filename);
    params.entry = Object.keys(params.entry).reduce((prev, bundleName) => {
        prev[bundleName] = prev[bundleName].map((p) => {
            return path.join(sourceDir, p);
        });
        return prev;
    }, params.entry);

    return {
        devtool: 'eval-source-map',
        entry: params.entry,
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
            )
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
