var webpack = require('webpack');
var common = require('./common.config');

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
            loader: 'babel-loader',
            options: {
                presets: ['es2015', 'stage-0', 'react'],
                cacheDirectory: true
            }
        }]
    });
    conf.plugins.push(new webpack.optimize.DedupePlugin());
    conf.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    conf.plugins.push(new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production')}}));
    conf.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    return conf;
};
