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
            cachePath = path.resolve(bus.config.workDir, 'ut-front');
            lassoCache = path.resolve(bus.config.workDir, 'lasso');
        },
        start: function() {
            return this && this.registerRequestHandler && this.registerRequestHandler([{
                method: 'GET',
                path: '/s/cache/{p*}',
                config: {auth: false},
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
                config: {auth: false},
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
                var success = {packer: config.packer, head: '', body: '<div id="utApp"></div><script src="/s/cache/index.js"></script>'};
                return new Promise((resolve, reject) => {
                    if (!webpackCfg.output.path) {
                        webpackCfg.output.path = cachePath;
                        if (this.config.hotReload) {
                            webpackCfg.output.publicPath = '/s/cache/';
                            return this.enableHotReload(webpackCfg)
                                .then(function() {
                                    resolve(success);
                                });
                        } else {
                            var compiler = webpack(webpackCfg);
                            compiler.run(function(err, stats) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(success);
                                }
                            });
                            compiler.watch({aggregateTimeout: 50, poll: true, watch: true}, (err, stats) => {
                                if (err) {
                                    this.log.error && this.log.error(err);
                                }
                                this.log.info && this.log.info(`>>> Webpack Compiled @${(new Date()).toTimeString()}`);
                            });
                        }
                    } else {
                        resolve(success);
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
                        },
                        babel: {
                            extensions: ['es6', 'js', 'jsx'],
                            presets: ['es2015-without-strict', 'react', 'stage-0'],
                            only: /(\\|\/)(impl|ut)\-/,
                            // sourceMaps: 'inline',
                            babelrc: false
                        }
                    }
                },
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
            delete lassoConfig.packer;
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
                            body: '<div id="utApp"></div>' + results.getBodyHtml()
                        });
                    }
                });
            });
        }
    };
    return result;
};
