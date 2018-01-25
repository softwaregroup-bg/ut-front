var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = (params) => {
    var entry = {};
    var plugins = [];
    var hashLabel = params.hashLabel.join('.');
    if (typeof params.entryPoint === 'string') {
        params.entryPoint = [params.entryPoint];
    } else if (!(params.entryPoint instanceof Array)) {
        throw new Error('"entryPoint" should be one of: Array|String');
    }

    entry = params.entryPoint.reduce((prev, item) => {
        var name = path.basename(item, '.js');
        prev[name] = [item];
        plugins.push(new HtmlWebpackPlugin({
            title: params.title,
            chunksSortMode: (a, b) => {
                if (a.files.filter((e) => (e.indexOf('manifest') >= 0)).length) {
                    return -1;
                } else if (b.files.filter((e) => (e.indexOf('manifest') >= 0)).length) {
                    return 1;
                }
                return a.files.filter((e) => (e.indexOf(name) >= 0)).length;
            },
            template: path.join(__dirname, 'template.html'),
            filename: `${name}.html`,
            chunks: ['vendor', 'manifest', name]})
        );
        return prev;
    }, entry);
    entry['vendor'] = require('./vendor');

    plugins.push(new webpack.IgnorePlugin(
        /^('source-map-support|app|browser-window|global-shortcut|crash-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request|dtrace-provider)$/
    ));

    plugins.push(new webpack.optimize.CommonsChunkPlugin({names: ['vendor', 'manifest'], filename: `[name].${hashLabel}.js`}));
    plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify(params.sharedVars.env)}));
    plugins.push(new webpack.DefinePlugin({NODE_ENV_SHARED: JSON.stringify(params.sharedVars)}));

    // plugins.push(new webpack.NoErrorsPlugin());

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
            modules: ['node_modules'],
            extensions: ['.js', '.jsx'],
            alias: {
                rc: require.resolve('./rc'),
                'joi': 'joi-browser',
                // These shims are needed for bunyan
                fs: require.resolve('./empty'),
                bufferutil: require.resolve('./empty'),
                mv: require.resolve('./empty'),
                'dtrace-provider': require.resolve('./empty'),
                'safe-json-stringify': require.resolve('./empty'),
                'source-map-support': require.resolve('./empty')
            }
        },
        plugins,
        module: {
            rules: [
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/font-woff'
                        }
                    }]
                }, {
                    test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    use: [{
                        loader: 'file-loader'
                    }]
                }, {
                    test: /\.json$/,
                    use: [{
                        loader: 'thread-loader',
                        options: {
                            workers: 1
                        }
                    }, {
                        loader: 'json-loader'
                    }]
                }, {
                    test: /.*\.(gif|png|jpe?g|svg|ico)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 30720000
                        }
                    }]
                }, {
                    test: /\.css$/,
                    exclude: [/public/],
                    use: [{
                        loader: 'style-loader',
                        options: {}
                    }, {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[path]___[name]__[local]___[hash:base64:5]',
                            context: path.dirname(require.main.filename)
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: params.postcssLoader || {
                            plugins: [
                                require('postcss-import')(params.cssImport),
                                require('postcss-cssnext')({}),
                                require('postcss-assets')(params.cssAssets),
                                require('postcss-merge-rules')(),
                                require('postcss-clean')()
                            ]
                        }
                    }]
                },
                ...(params.rulesImport || [])
            ]
        }
    };
};
