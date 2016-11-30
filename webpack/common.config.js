var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = (params) => {
    var entry = {};
    var plugins = [];
    var hashLabel = params.hashLabel.join('.');
    if (typeof params.entryPoint === 'string') {
        params.entryPoint = [params.entryPoint];
    }

    entry = params.entryPoint.reduce((prev, item) => {
        var name = path.basename(item, '.js');
        prev[name] = [item];
        plugins.push(new HtmlWebpackPlugin({
            title: params.title,
            chunksSortMode: (a, b) => (a.files.filter((e) => (e.indexOf(name) >= 0)).length),
            template: path.join(__dirname, 'template.html'),
            filename: `${name}.html`,
            chunks: ['vendor', 'manifest', name]})
        );
        return prev;
    }, {});
    entry['vendor'] = require('./vendor');

    plugins.push(new webpack.IgnorePlugin(
        /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request|dtrace\-provider)$/
    ));

    plugins.push(new webpack.optimize.CommonsChunkPlugin({names: ['manifest', 'vendor'], filename: `[name].${hashLabel}.js`}));

    return {
        entry,
        output: {
            filename: `[name].${params.hashLabel[0]}.js`,
            chunkFilename: `${hashLabel}.js`,
            path: params.outputPath,
            publicPath: '/'
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
        plugins,
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
