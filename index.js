const path = require('path');
var serverRequire = require;

module.exports = function(moduleConfig) {
    var bus;

    var result = {
        init: function(b) {
            bus = b;
            this.cachePath = {};
        },
        start: function() {
            var redirectTo = path.basename(this.config.entryPoint, '.js');
            this.cachePath = path.resolve(
                ((this.config.packer && this.config.packer.name) ? this.config.packer.cachePath : this.config.dist) ||
                path.join(bus.config.workDir, 'ut-front', this.config.id));

            // do index route
            var indexRoute = {
                method: 'GET',
                path: '/',
                config: {auth: false},
                handler: {
                    file: {
                        confine: this.cachePath,
                        path: path.join(this.cachePath, `${redirectTo}.html`)
                    }
                }
            };
            if (this.config.packer && this.config.packer.name === 'webpack' && this.config.packer.hotReload) {
                indexRoute.handler = (req, reply) => (reply().redirect(`/${redirectTo}.html`));
            }
            var globalRoute = this && this.registerRequestHandler && this.registerRequestHandler([indexRoute, {
                method: 'GET',
                path: '/{p*}',
                config: {auth: false},
                handler: {
                    directory: {
                        path: this.cachePath,
                        listing: true,
                        index: true,
                        lookupCompressed: true
                    }
                }
            }]);
            if (this.config.packer && this.config.packer.name === 'webpack') {
                const webpack = serverRequire('webpack');
                var env = (this.bus.config && this.bus.config.params && this.bus.config.params.env) || 'production';
                var wb = serverRequire('./webpack/ut-front.config')({
                    sharedVars: {env},
                    outputPath: this.cachePath,
                    title: '@title!',
                    entryPoint: this.config.entryPoint,
                    jsxExclude: this.config.packer.jsxExclude
                                ? this.config.packer.jsxExclude.constructor.name === 'RegExp'
                                    ? this.config.packer.jsxExclude
                                    : new RegExp(this.config.packer.jsxExclude)
                                : /(node_modules(\\|\/)(?!(.*impl|.*ut|.*dfsp)-).)/,
                    themePath: moduleConfig.themePath,
                    configPath: moduleConfig.configPath,
                    postcssLoader: this.config.postcssLoader,
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
    return result;
};
