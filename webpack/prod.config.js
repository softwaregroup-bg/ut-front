var webpack = require('webpack');
var common = require('./common.config');
var os = require('os');
var path = require('path');

module.exports = (params) => {
    params.hashLabel = ['[chunkhash]'];
    var conf = common(params);
    conf.bail = true;
    conf.name = 'browser';
    // conf.resolve.modules.push('dev');
    // conf.resolve.symlinks = false;
    conf.module.rules.unshift({
        test: /\.jsx?$/,
        exclude: /(node_modules(\\|\/)(?!(impl|ut|.*dfsp)-).)/,
        use: [{
            loader: 'thread-loader',
            options: {
                workers: 4
            }
        }, {
            loader: 'babel-loader',
            options: {
                presets: ['env', 'stage-0', 'react'],
                cacheDirectory: path.resolve(os.homedir(), '.ut', 'ut-front', 'cache')
            }
        }]
    });
    conf.plugins.push(new webpack.optimize.DedupePlugin());
    conf.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    conf.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    return conf;
};
