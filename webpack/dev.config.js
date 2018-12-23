// var webpack = require('webpack');
var common = require('./common.config');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (params) => {
    var conf = common(params);
    conf.mode = 'development';
    conf.devtool = params.hotReload ? 'eval' : 'eval-source-map';
    conf.module.exprContextCritical = false;
    conf.plugins.push(new BellOnBundlerErrorPlugin());
    if (params.analyzer) conf.plugins.push(new BundleAnalyzerPlugin());

    return conf;
};
