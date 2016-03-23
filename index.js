const path = require('path');
const lasso = require('lasso');
const assign = require('lodash/object/assign');
const webpack = require('webpack')

module.exports = function(moduleConfig) {
    var bus;
    var cachePath;
    var lassoCache;
    var result = {
        init: function(b) {
            bus = b;
            cachePath = path.resolve(bus.config.workDir, 'ut-front-cache');
            lassoCache = path.resolve(bus.config.workDir, 'lasso');
        },
        start: function() {
            return this && this.registerRequestHandler && this.registerRequestHandler([{
                method: 'GET',
                path: '/s/cache/{p*}',
                handler: {
                    directory: {
                        path: cachePath,
                        listing: false,
                        index: true,
                        lookupCompressed: true
                    }
                }

            }, {
                method: 'GET',
                path: '/pack/{lib?}',
                handler: function(request, reply) {
                    result.pack()
                        .then(function() {
                            reply.redirect('/s/' + (request.params.lib || 'sc') + '/index.html');
                        });
                }
            }]);
        },
        pack: function(config) {
            if (moduleConfig.loader && moduleConfig.loader === 'lasso') {
                var lassoConfig = assign({
                    plugins: [{
                        plugin: 'lasso-require',
                        config: {
                            builtins: {
                                'os': 'os-browserify',
                                'fs': require.resolve('ut-bus/browser/fs'),
                                'stream': require.resolve('stream-browserify')
                            }
                        }
                    },
                        'lasso-jsx',
                        'lasso-marko'
                    ],
                    urlPrefix: '/s/cache',
                    outputDir: cachePath,
                    cacheDir: lassoCache,
                    fingerprintsEnabled: false,
                    minifyJS: true,
                    resolveCssUrls: true,
                    bundlingEnabled: true
                }, moduleConfig, config);

                var main = lassoConfig.main;
                var from = lassoConfig.from;
                delete lassoConfig.main;
                delete lassoConfig.from;
                lasso.configure(lassoConfig);

                return new Promise(function(resolve, reject) {
                    lasso.lassoPage({
                        name: 'app',
                        dependencies: [
                            'require-run: ' + main
                        ],
                        from: from || __dirname
                    }, function(err, results) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                loader: moduleConfig.loader,
                                head: results.getHeadHtml(),
                                body: results.getBodyHtml()
                            });
                        }
                    });
                });
            }
            return new Promise(function(resolve, reject) {
                webpack({
                    devtool: 'cheap-module-eval-source-map',
                    entry: {
                        index: './browser/index.js'
                    },
                    output: {
                        filename: path.join(cachePath, '[name].js')
                    },
                    node: {
                        cluster: 'empty',
                        fs: 'empty',
                        tls: 'empty',
                        repl: 'empty'
                    },
                    resolve: {modulesDirectories: ['node_modules', 'dev']},
                    module: {
                        loaders: [
                            {
                                test: /\.jsx?$/,
                                exclude: /(node_modules)/,
                                loader: 'babel',
                                query: {
                                    presets: ['react', 'es2015']
                                }
                            },
                            { test: /\.json$/, loader: 'json' }
                        ]
                    },
                    plugins: [
                        new webpack.IgnorePlugin(/^(app|browser\-window|global\-shortcut|crash\-reporter|protocol|dgram|JSONStream|inert|hapi)$/)
                    ]
                }, function(err, stats) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            loader: moduleConfig.loader
                        });
                    }
                });
            });
        }
    };
    return result;
};
