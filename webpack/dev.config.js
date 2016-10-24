var webpack = require('webpack');
var path = require('path');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = (params) => ({
    devtool: 'eval-source-map',
    entry: params.entry,
    output: {
        filename: '[name].js',
        publicPath: '/s/cache/',
        path: params.outputPath
    },
    node: {
        cluster: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        repl: 'empty'
    },
    closures: {
        translate: function(config) {
            return new Promise((resolve, reject) => {
                if (this.translateResult) {
                    resolve(this.translateResult);
                    return;
                }
                if (this.loading) {
                    return this.translate(config);
                }
                this.loading = true;
                if (config && config.language) {
                    params.languages().then((languages) => {
                        var languageId = languages[0].filter((language) => {
                            return language.iso2Code === config.language;
                        });
                        var translateParams = {};
                        if (languageId[0]) {
                            translateParams = {
                                languageId: languageId[0].languageId
                            };
                        }
                        params.translate(translateParams).then((result) => {
                            this.translateResult = result;
                            resolve(result);
                        });
                    });
                } else {
                    params.translate().then((result) => {
                        this.translateResult = result;
                        resolve(result);
                    });
                }
            });
        }
    },
    plugins: [
        new webpack.IgnorePlugin(
            /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/
        ),
        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname,
                postcss: [
                    require('postcss-import')({
                        path: path.join('../', params.implName, 'themes', params.themeName)
                    })
                ]
            }
        }),
        new webpack.DefinePlugin(params.sharedVars)
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules(\\|\/)(?!(.*impl|.*ut|.*dfsp)\-).)/,
            loaders: ['react-hot', 'babel']
        }, {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'react-hot'
        }, {
            test: /\.jsx?$/,
            exclude: /(node_modules(\\|\/)(?!(.*impl|.*ut|.*dfsp)\-).)/,
            loader: 'babel',
            query: {
                presets: ['es2015', 'stage-0', 'react'],
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
            loaders: ['url-loader?limit=30720000']
        }, {
            test: /\.css$/,
            loaders: [
                'style-loader', {
                    loader: 'css-loader',
                    query: {
                        modules: true,
                        importLoaders: 1,
                        localIdentName: '[test]__[style]___[hash:base64:5]'
                    }
                },
                'postcss-loader'
            ]
        }]
    }
});
