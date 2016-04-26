const path = require('path');
const lasso = require('lasso');
const assign = require('lodash/object/assign');
const webpack = require('webpack');

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
                        path: path.join(cachePath, this.config.id),
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
            if (this.config.packer && this.config.packer.name === 'webpack') {
                return new Promise((resolve, reject) => {
                    var success = {packer: this.config.packer.name, head: '', body: '<div id="utApp"></div><script src="/s/cache/bundle.js"></script>'};
                    if (!this.webpack) {
                        this.webpack = require('./webpack.config')({
                            entryPoint: this.config.packer.entryPoint,
                            outputPath: path.join(cachePath, this.config.id)
                        });
                        if (this.config.hotReload) {
                            this.webpack.output.publicPath = '/s/cache/';
                            return this.enableHotReload(this.webpack)
                                .then(function() {
                                    resolve(success);
                                });
                        } else {
                            webpack(this.webpack, (err, stats) => {
                                if (err) {
                                    this.log.error && this.log.error(err);
                                    reject(err);
                                } else {
                                    this.log.info && this.log.info(`>>> Webpack Compiled @${(new Date()).toTimeString()}`);
                                    resolve(success);
                                }
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
