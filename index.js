const path = require('path');
const assign = require('lodash/object/assign');

module.exports = function(moduleConfig) {
    var bus;
    var cachePath;
    var lassoCache;

    var result = {
        init: function(b) {
            bus = b;
        },
        start: function() {
            cachePath = path.resolve(this.config.packer.cachePath || path.join(bus.config.workDir, 'ut-front', this.config.id));
            lassoCache = path.resolve(bus.config.workDir, 'lasso');

            var r = this && this.registerRequestHandler && this.registerRequestHandler([{
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
            if (this.config.packer && this.config.packer.name === 'webpack') {
                const webpack = require('webpack');
                var wb = require('./webpack.config')({
                    entryPoint: this.config.packer.entryPoint,
                    outputPath: cachePath
                }, this.config.packer.hotReload);
                wb.assetsConfig = this.config.packer.assets || {};
                if (this.config.hotReload) {
                    wb.output.publicPath = '/s/cache/';
                    process.nextTick(() => (this.enableHotReload(wb)));
                } else {
                    webpack(wb, (err, stats) => {
                        if (err) {
                            this.log.error && this.log.error(err);
                        } else {
                            this.log.info && this.log.info(`>>> Webpack Compiled @${(new Date()).toTimeString()}`);
                        }
                    });
                }
            }
            return r;
        },
        pack: function(config) {
            if (this.config.packer) {
                if (this.config.packer.name === 'webpack') {
                    return {packer: this.config.packer.name, head: '', body: '<div id="utApp"></div><script src="/s/cache/bundle.js"></script>'};
                } else if (this.config.packer.name === 'lasso') {
                    const lasso = require('lasso');
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
            }
        }
    };
    return result;
};
