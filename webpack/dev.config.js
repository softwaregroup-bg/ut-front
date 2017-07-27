var webpack = require('webpack');
var common = require('./common.config');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');

module.exports = (params) => {
    params.hashLabel = ['[hash]', '[id]'];
    var conf = common(params);
    conf.devtool = 'eval-source-map';
    conf.output.pathinfo = true;
    conf.resolve.modules.push('dev');
    conf.resolve.symlinks = false;
    conf.module.exprContextCritical = false;
    conf.module.rules.unshift({
        test: /\.jsx?$/,
        exclude: /(node_modules(\\|\/)(?!(impl|ut|.*dfsp)-).)/,
        use: [{
            loader: 'thread-loader',
            options: {
                workers: 4
            }
        }, {
            loader: 'react-hot-loader/webpack'
        }, {
            loader: 'babel-loader',
            options: {
                presets: ['env', 'react', 'react-hmre'],
                cacheDirectory: true
            }
        }]
    });
    conf.plugins.push(new webpack.NamedModulesPlugin());
    conf.plugins.push(new webpack.DefinePlugin(params.sharedVars));
    conf.plugins.push(new BellOnBundlerErrorPlugin());
    return conf;
};
