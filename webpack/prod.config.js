var webpack = require('webpack');
var common = require('./common.config');

module.exports = (params) => {
    params.hashLabel = '[chunkhash]';
    var conf = common(params);
    conf.bail = true;
    conf.name = 'browser';
    conf.module.loaders.unshift({test: /\.jsx?$/, exclude: /(node_modules(\\|\/)(?!(impl|ut)\-).)/, loaders: ['babel-loader?presets[]=es2015&presets[]=stage-0&presets[]=react']});
    conf.plugins.push(new webpack.optimize.DedupePlugin());
    conf.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
    conf.plugins.push(new webpack.DefinePlugin({'process.env': {'NODE_ENV': JSON.stringify('production')}}));
    conf.plugins.push(new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}));
    return conf;
};
