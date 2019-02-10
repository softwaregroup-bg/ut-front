var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var os = require('os');

module.exports = (params) => {
    var entry = {};
    var plugins = [];
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
            template: path.join(__dirname, 'template.html'),
            filename: `${name}.html`,
            chunks: ['runtime', 'vendor', 'ut', 'hmr', name]
        }));
        return prev;
    }, entry);

    plugins.push(new webpack.IgnorePlugin(
        /^('source-map-support|app|browser-window|global-shortcut|crash-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request|dtrace-provider)$/
    ));
    if (params.hotReload) {
        plugins.push(new webpack.HotModuleReplacementPlugin());
        entry.hmr = 'webpack-hot-middleware/client';
    }

    return {
        entry,
        name: 'browser',
        output: {
            filename: params.hotReload ? '[name].[hash].js' : '[name].[chunkhash].js',
            chunkFilename: params.hotReload ? '[name].[hash].js' : '[name].[chunkhash].js',
            path: params.outputPath,
            publicPath: '/'
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/](?!(impl|ut)-)/i,
                        name: 'vendor',
                        chunks: 'all'
                    },
                    ut: {
                        test: /[\\/]node_modules[\\/](impl|ut)-/i,
                        name: 'ut',
                        chunks: 'all'
                    }
                }
            },
            runtimeChunk: 'single'
        },
        node: {
            cluster: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            repl: 'empty'
        },
        resolve: {
            modules: ['node_modules', 'dev'],
            symlinks: false,
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
                    test: /\.jsx?$/,
                    exclude: /node_modules[\\/](?!(impl|ut)-)/,
                    use: [{
                        loader: 'thread-loader',
                        options: {
                            workers: 4
                        }
                    }, {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ],
                            plugins: [
                                '@babel/plugin-transform-runtime',
                                ['@babel/plugin-proposal-class-properties', {loose: true}],
                                params.hotReload && 'react-hot-loader/babel'
                            ].filter(value => value),
                            sourceType: 'unambiguous', // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
                            babelrc: false,
                            cacheCompression: false,
                            cacheDirectory: path.resolve(os.homedir(), '.ut', 'ut-front', 'cache')
                        }
                    }]
                },
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
                    test: /.*\.(gif|png|jpe?g|svg|ico)$/i,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 30720000
                        }
                    }]
                }, {
                    test: /\.css$/,
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
                        options: {
                            plugins: [
                                require('postcss-import')(params.cssImport || {path: path.resolve('config')}),
                                require('postcss-preset-env')({preserve: false}),
                                require('postcss-assets')(params.cssAssets || {relative: true}),
                                require('postcss-merge-rules')(),
                                require('postcss-clean')({
                                    level: 2,
                                    rebase: false
                                })
                            ]
                        }
                    }]
                }
            ]
        }
    };
};
