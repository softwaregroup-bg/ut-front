const path = require('path');
const assign = require('lodash.assign');

module.exports = function(moduleConfig) {
    var bus;
    var cachePath;
    var lassoCache;

    var result = {
        init: function(b) {
            bus = b;
        },
        start: function() {
            cachePath = path.resolve(
                (this.config.packer && this.config.packer.name)
                ? (this.config.packer.cachePath || path.join(bus.config.workDir, 'ut-front', this.config.id))
                : this.config.dist);
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
                path: '/s/cache/i18n/{p*}',
                config: {auth: false},
                handler: {
                    directory: {
                        path: path.join(cachePath),
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
                var wb = require('./webpack/ut-front.config')({
                    entry: this.config.packer.entry,
                    outputPath: cachePath,
                    translate: this.config.packer.hotReload ? bus.importMethod('core.translation.fetch') : this.config.packer.translate,
                    languages: bus.importMethod('core.language.fetch')
                }, this.config.packer.hotReload);
                wb.assetsConfig = this.config.packer.assets || {};
                if (this.config.packer.hotReload) {
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
            if (config.packer && config.packer.name === 'webpack') {
                return {head: '', body: '<div id="utApp"></div><script src="/s/cache/bundle.js"></script>'};
            } else if (config.packer && config.packer.name === 'lasso') {
                const serverRequire = require;
                const lasso = serverRequire('lasso');
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
            } else {
                return {head: '', body: `<div id="utApp"></div><script src="/s/cache/${config.bundle || 'bundle'}.js"></script>`};
            }
        }
    };
    return result;
};
