var path = require('path');
var lasso = require('lasso');
var when = require('when');
var _ = require('lodash');
var bus;
var cachePath;

module.exports = function (config) {
    var result = {
        init: function (b) {
            bus = b;
            cachePath = path.join(bus.config.workDir, 'ut-front-cache');
        },
        initRoutes: function () {
            bus.importMethod('internal.registerRequestHandler')([{
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
                handler: function (request, reply) {
                    result.pack(config)
                        .then(function () {
                            reply.redirect('/s/sc/index.html');
                        });
                }
            }]);
        },
        pack: function (config) {
            var main = config.main;
            delete config.main;
            lasso.configure(_.assign({
                    plugins: [
                        'lasso-require',
                        'lasso-jsx',
                        'lasso-marko',
                        'lasso-minify-js'
                    ],
                    outputDir: cachePath,
                    fingerprintsEnabled: false,
                    minify: false,
                    resolveCssUrls: true,
                    bundlingEnabled: true
                }, config)
            );
            return when.promise(function (resolve, reject) {
                lasso.lassoPage({
                        name: 'app',
                        dependencies: [
                            'require-run: ' + main
                        ],
                        from: __dirname
                    },
                    function (err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
            });
        }
    };
    return result;
};
