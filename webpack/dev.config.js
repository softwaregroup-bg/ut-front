var webpack = require('webpack');
var common = require('./common.config');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = (params) => {
    var conf = common(params);
    conf.devtool = 'eval-source-map';
    conf.resolve.modules.push('dev');
    conf.resolve.symlinks = false;
    conf.module.exprContextCritical = false;
    conf.module.loaders.unshift({test: /\.jsx?$/, exclude: params.jsxExclude, loaders: ['react-hot', 'babel?presets[]=es2015&presets[]=stage-0&presets[]=react&cacheDirectory=true']});
    conf.plugins.push(new webpack.DefinePlugin(params.sharedVars));
    conf.plugins.push(new BellOnBundlerErrorPlugin());
    return conf;
};
