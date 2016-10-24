var webpack = require('webpack');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = (params) => ({
    devtool: 'eval-source-map',
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
                    return params.languages().then((languages) => {
                        var languageId = languages[0].filter((language) => {
                            return language.iso2Code === config.language;
                        });
                        var translateParams = {};
                        if (languageId[0]) {
                            translateParams = {
                                languageId: languageId[0].languageId
                            };
                        }
                        return params.translate(translateParams).then((result) => {
                            this.translateResult = result;
                            return resolve(result);
                        });
                    });
                } else {
                    return params.translate().then((result) => {
                        this.translateResult = result;
                        return resolve(result);
                    });
                }
            });
        }
    },
    entry: params.entry,
    output: {
        filename: '[name].js',
        publicPath: '/s/cache/',
        path: params.outputPath
    },
    target: 'web',
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
    module: {
        exprContextCritical: false,
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: params.jsxExclude,
                loader: 'react-hot!babel?presets[]=es2015&presets[]=stage-0&presets[]=react&cacheDirectory=true'
            },
            {
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
                loader: 'url?limit=30720000'
            }, {
                test: /\.css$/,
                loader: 'style?sourceMap!css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]'
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(
            /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/
        ),
        new BellOnBundlerErrorPlugin(),
        new webpack.DefinePlugin(params.sharedVars)
    ]
});
