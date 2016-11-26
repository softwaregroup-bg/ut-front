const path = require('path');
const assign = require('lodash.assign');
const crypto = require('crypto');

module.exports = function(moduleConfig) {
    var bus;
    var cachePath;
    var lassoCache;

    var result = {
        init: function(b) {
            bus = b;
        },
        start: function() {
            this.bundleName = path.basename(this.config.entryPoint, '.js');

            cachePath = path.resolve(
                ((this.config.packer && this.config.packer.name) ? this.config.packer.cachePath : this.config.dist) ||
                path.join(bus.config.workDir, 'ut-front', this.config.id));
            lassoCache = path.resolve(bus.config.workDir, 'lasso');

            var r = this && this.registerRequestHandler && this.registerRequestHandler([{
                method: 'GET',
                path: '/static/lib/{p*}',
                config: {auth: false},
                handler: {
                    directory: {
                        path: cachePath,
                        listing: false,
                        index: true,
                        lookupCompressed: true
                    }
                }
            }]);
            if (this.config.packer && this.config.packer.name === 'webpack') {
                const webpack = require('webpack');
                var env = (this.bus.config && this.bus.config.params && this.bus.config.params.env) || 'production';
                var wb = require('./webpack/ut-front.config')({
                    sharedVars: {'process.env': {NODE_ENV: `'${env}'`}},
                    outputPath: cachePath,
                    entryPoint: this.config.entryPoint,
                    jsxExclude: this.config.packer.jsxExclude
                                ? this.config.packer.jsxExclude.constructor.name === 'RegExp'
                                    ? this.config.packer.jsxExclude
                                    : new RegExp(this.config.packer.jsxExclude)
                                : /(node_modules(\\|\/)(?!(.*impl|.*ut|.*dfsp)\-).)/,
                    themePath: moduleConfig.themePath,
                    configPath: moduleConfig.configPath
                }, this.config.packer.hotReload);

                if (this.config.packer.hotReload) {
                    wb.output.publicPath = '/static/lib/';
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
                return {head: '', body: `<div id="utApp"></div><script src="/static/lib/vendor.${this.bundleName}.js"></script><script src="/static/lib/${this.bundleName}.js"></script>`};
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
                    urlPrefix: '/static/lib',
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
                return {head: '', body: `<div id="utApp"></div><script src="/static/lib/vendor.${this.bundleName}.js"></script><script src="/static/lib/${this.bundleName}.js"></script>`};
            }
        }
    };
    return result;
};
