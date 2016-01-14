var path = require('path');
var lasso = require('lasso');
var when = require('when');
var assign = require('lodash/object/assign');
var fs = require('fs');
var serverRequire = require;

function findRootDir(dirname) {
    if (dirname === '' || dirname === '/') {
        return null;
    }

    var packagePath = path.join(dirname, 'package.json');

    if (dirname.indexOf('node_modules') === -1 && fs.existsSync(packagePath)) {
        return dirname;
    }

    var parentDirname = path.dirname(dirname);

    if (parentDirname !== dirname) {
        return findRootDir(parentDirname);
    } else {
        return null;
    }
}

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
                        path: cachePath,
                        listing: false,
                        index: true
                    }
                }

            }, {
                method: 'GET',
                path: '/pack',
                handler: function(request, reply) {
                    result.pack(moduleConfig)
                        .then(function() {
                            reply.redirect('/s/sc/index.html');
                        });
                }
            }, {
                method: 'GET',
                path: '/s/sc/debug.html',
                handler: function(request, reply) {
                    result.pack(assign({minifyJS: false, bundlingEnabled: false}, moduleConfig))
                        .then(function(pack) {
                            reply(pack);
                        });
                }
            }]);
        },
        pack: function(config) {
            var main = config.main;
            var from = config.from;
            delete config.main;
            delete config.from;
            lasso.configure(assign({
                plugins: [
                    {
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
            }, config));

            return when.promise(function(resolve, reject) {
                lasso.lassoPage({
                    name: 'app',
                    dependencies: [
                        'require-run: ' + main
                    ],
                    from: from || __dirname
                },
                function(err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">' +
                            '<meta name="viewport" content="width=device-width, initial-scale=1"><script>var isomorphicDir="isomorphic/";</script>' +
                            '<script src="isomorphic/system/modules/ISC_Core.js"></script>' +
                            '<script src="isomorphic/system/modules/ISC_Foundation.js"></script>' +
                            '<script src="isomorphic/system/modules/ISC_Containers.js"></script>' +
                            '<script src="isomorphic/system/modules/ISC_Grids.js"></script>' +
                            '<script src="isomorphic/system/modules/ISC_Forms.js"></script>' +
                            '<script src="isomorphic/system/modules/ISC_DataBinding.js">' +
                            '</script><script src="isomorphic/skins/Enterprise/load_skin.js">' +
                            '</script><meta charset="UTF-8"><script type="text/javascript">global=window;' +
                            '</script><title>UnderTree</title>' +
                            results.getHeadHtml() +
                            '</head><body>' +
                            results.getBodyHtml() +
                            '</body></html>');
                    }
                });
            });
        }
    };
    return result;
};
