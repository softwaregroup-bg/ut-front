const path = require('path');
var serverRequire = require;

module.exports = () => function utFront({config}) {
    return {
        gateway: () => [
            function http({utBus}) {
                return {
                    init: function() {
                        this.cachePath = {};
                    },
                    start: function() {
                        var redirectTo = path.basename(this.config.entryPoint, '.js');
                        this.cachePath = path.resolve(
                            ((this.config.packer && this.config.packer.name) ? this.config.packer.cachePath : this.config.dist) ||
                            path.join(utBus.config.workDir, 'ut-front', this.config.id));

                        // do index route
                        var indexRoute = {
                            method: 'GET',
                            path: '/',
                            options: {auth: false},
                            handler: {
                                file: {
                                    confine: this.cachePath,
                                    path: path.join(this.cachePath, `${redirectTo}.html`)
                                }
                            }
                        };
                        if (this.config.packer && this.config.packer.name === 'webpack' && this.config.packer.hotReload) {
                            indexRoute.handler = (req, h) => (h.response().redirect(`/${redirectTo}.html`));
                        }
                        var globalRoute = this && this.registerRequestHandler && this.registerRequestHandler([indexRoute, {
                            method: 'GET',
                            path: '/{p*}',
                            options: {auth: false},
                            handler: {
                                directory: {
                                    path: this.cachePath,
                                    index: false,
                                    lookupCompressed: true
                                }
                            }
                        }]);
                        if (this.config.packer && this.config.packer.name === 'webpack') {
                            this.log.info && this.log.info('Starting webpack');
                            const webpack = serverRequire('webpack');
                            var wb = serverRequire('./webpack/ut-front.config')({
                                outputPath: this.cachePath,
                                title: '@title!',
                                hotReload: this.config.packer.hotReload,
                                entryPoint: this.config.entryPoint,
                                cssImport: this.config.cssImport,
                                cssAssets: this.config.cssAssets
                            }, this.config.packer.hotReload);

                            if (this.config.packer.hotReload) {
                                wb.output.publicPath = '/';
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
                        return globalRoute;
                    }
                };
            }
        ]
    };
};
