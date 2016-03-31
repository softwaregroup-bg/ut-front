const path = require('path');
const lasso = require('lasso');
const assign = require('lodash/object/assign');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

module.exports = function(moduleConfig) {
    var bus;
    var cachePath;
    var lassoCache;
    var webpackStarted = false;
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
                    result.pack({packer: request.params.lib})
                        .then(function() {
                            reply.redirect('/s/' + (request.params.lib || 'sc') + '/index.html');
                        });
                }
            }]);
        },
        pack: function(config) {
            if (config.packer && config.packer === 'webpack') {
                return new Promise(function(resolve, reject) {
                    if (!webpackStarted) {
                        webpackStarted = true;
                        var webpackCfg = assign({}, webpackConfig);
                        webpackCfg.output.path = cachePath;
                        webpack(webpackCfg, function(err, stats) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({packer: config.packer});
                            }
                        });
                    } else {
                        resolve({packer: config.packer});
                    }
                });
            }
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
                            packer: config.packer,
                            head: results.getHeadHtml(),
                            body: results.getBodyHtml()
                        });
                    }
                });
            });
        }
    };
    return result;
};
