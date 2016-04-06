const path = require('path');
const lasso = require('lasso');
const assign = require('lodash/object/assign');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
var webpackCfg = assign({}, webpackConfig);

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
                    if (!webpackCfg.output.path) {
                        webpackCfg.output.path = cachePath;
                        var compiler = webpack(webpackCfg);
                        compiler.run(function(err, stats) {
                            if (err) {
                                reject(err);
                            } else {
                                var fs = require('fs');
                                fs.appendFileSync('/home/zetxx/Desktop/wb.txt', JSON.stringify(stats.toJson(), null, 2))
                                resolve({packer: config.packer, head: '', body: '<div id="utApp"></div><script src="/s/cache/index.js"></script>'});
                            }
                        });
                        compiler.watch({
                            aggregateTimeout: 30,
                            poll: true
                        }, function(err, stats) {
                            if (err) {
                                throw err;
                            }
                        });
                    } else {
                        resolve({packer: config.packer, head: '', body: '<div id="utApp"></div><script src="/s/cache/index.js"></script>'});
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
