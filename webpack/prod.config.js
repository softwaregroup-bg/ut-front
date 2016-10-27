var webpack = require('webpack');
var path = require('path');

module.exports = (params) => {
    var themeName = params.themeName || 'default';
    var implName = params.implName || 'impl-standard';

    return {
        entry: params.entry,
        output: {
            filename: '[name].js',
            publicPath: '/s/cache/',
            path: params.outputPath
        },
        name: 'browser',
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
        plugins: [
            // Injects options object per loader (Webpack 2 specific)
            new webpack.LoaderOptionsPlugin({
                options: {
                    postcss: [
                        require('postcss-import')({
                            addDependencyTo: webpack,
                            // where to look for files when @import [filename].css is used in another css file
                            path: [path.join('../', implName, 'themes', themeName), path.join('../', implName, 'config')]
                        }),
                        // Transforms CSS specs into more compatible CSS so you don’t need to wait for browser support
                        require('postcss-cssnext')
                    ]
                }
            }),
            new webpack.IgnorePlugin(
                /^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi|socket\.io|winston|async|bn\.js|engine\.io|url|glob|mv|minimatch|stream-browserify|browser-request)$/
            ),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ],
        module: {
            loaders: [{
                test: /\.jsx?$/,
                exclude: /(node_modules(\\|\/)(?!(.*impl|.*ut|.*dfsp)\-).)/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'stage-0', 'react']
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
                loaders: [
                    'url-loader?limit=30720000'
                    // todo find why the below breaks on windows
                    // 'image-webpack?{progressive:true, optimizationLevel: 7, interlaced: false, pngquant:{quality: "65-90", speed: 4}}'
                ]
            }, {
                test: /\.css$/,
                loader: 'style?sourceMap!css?modules&importLoaders=1&localIdentName=[path]___[name]__[local]___[hash:base64:5]!postcss-loader'
            }]
        },
        closures: {
            translate: function() {
                return new Promise((resolve, reject) => {
                    resolve(params.translate);
                });
            }
        }
    };
};
