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
                                loader: 'babel', // 'babel-loader' is also a legal name to reference
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
                        resolve(stats);
                    }
                });
            });
        }
    };
    return result;
};
