var path = require('path');
var lasso = require('lasso');
var when = require('when');
var assign = require('lodash/object/assign');
var bus;
var registerRequestHandlers = [];
var registeredHandlersCache = {};
var config;

module.exports = function(config) {
    var result = {
        init: function(b) {
            bus = b;
            this.cachePath = path.join(bus.config.workDir, 'ut-front-cache');
            this.lassoCache = path.join(bus.config.workDir, 'lasso');
            config = bus.config.ussd;
            if (config.registerRequestHandlers && config.registerRequestHandlers.length > 0){
                for (var i = 0, rrhl = config.registerRequestHandlers.length; i < rrhl; i = i + 1) {
                    registerRequestHandlers.push({f: bus.importMethod(config.registerRequestHandlers[i]), name: config.registerRequestHandlers[i]});
                }
            }
        },
        initRoutes: function() {
            var self = this;
            registerRequestHandlers.forEach(function(registerRequestHandler) {
                if (registeredHandlersCache[registerRequestHandler.name]) {//already registered, skipping
                    return;
                }
                registeredHandlersCache[registerRequestHandler.name] = 1;

                registerRequestHandler.f([{
                    method: 'GET',
                    path: '/s/sc/{p*}',
                    handler: {
                        directory: {
                            path: path.join(__dirname, 'browser'),
                            listing: false,
                            index: true
                        }
                    }
                }, {
                    method: 'GET',
                    path: '/s/cache/{p*}',
                    handler: {
                        directory: {
                            path: self.cachePath,
                            listing: false,
                            index: true
                        }
                    }

                }, {
                    method: 'GET',
                    path: '/pack',
                    handler: function(request, reply) {
                        result.pack(config)
                            .then(function() {
                                reply.redirect('/s/sc/index.html');
                            });
                    }
                }, {
                    method: 'GET',
                    path: '/s/sc/debug.html',
                    handler: function(request, reply) {
                        result.pack(assign({minifyJS: false, bundlingEnabled:false},config))
                            .then(function(result) {
                                reply(result);
                            });
                    }
                }]);
            });
        },
        pack: function(config) {
            var main = config.main;
            delete config.main;
            lasso.configure(assign({
                    plugins: [
                        {
                            plugin: 'lasso-require',
                            config: {
                                builtins: {
                                    'os': 'os-browserify',
                                    'fs': 'ut-bus/browser/fs'
                                }
                            }
                        },
                        'lasso-jsx',
                        'lasso-marko'
                    ],
                    urlPrefix: '/s/cache',
                    outputDir: this.cachePath,
                    cacheDir: this.lassoCache,
                    fingerprintsEnabled: false,
                    minifyJS: true,
                    resolveCssUrls: true,
                    bundlingEnabled: true
                }, config)
            );
            return when.promise(function(resolve, reject) {
                lasso.lassoPage({
                        name: 'app',
                        dependencies: [
                            'require-run: ' + main
                        ],
                        from: __dirname
                    },
                    function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                                '<meta name="viewport" content="width=device-width, initial-scale=1"><script>var isomorphicDir="isomorphic/";</script>' +
                                '<script src="isomorphic/system/modules/ISC_Core.js"></script><script src="isomorphic/system/modules/ISC_Foundation.js">' +
                                '</script><script src="isomorphic/system/modules/ISC_Containers.js"></script>' +
                                '<script src="isomorphic/system/modules/ISC_Grids.js"></script><script src="isomorphic/system/modules/ISC_Forms.js"></script>' +
                                '<script src="isomorphic/system/modules/ISC_DataBinding.js"></script><script src="isomorphic/skins/Enterprise/load_skin.js">' +
                                '</script><meta charset="UTF-8"><script type="text/javascript">global=window;' +
                                '</script><title>UnderTree</title>' +
                                result.getHeadHtml() +
                                '</head><body>' +
                                result.getBodyHtml() +
                                '</body></html>');
                        }
                    });
            });
        }
    };
    return result;
};
