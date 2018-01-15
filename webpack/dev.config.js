var webpack = require('webpack');
var common = require('./common.config');
var BellOnBundlerErrorPlugin = require('bell-on-bundler-error-plugin');
var os = require('os');
var path = require('path');

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
                presets: ['env', 'stage-0', 'react', 'react-hmre'],
                plugins: ['transform-decorators-legacy'],
                cacheDirectory: path.resolve(os.homedir(), '.ut', 'ut-front', 'cache')
            }
        }]
    });
    conf.plugins.push(new webpack.NamedModulesPlugin());
    conf.plugins.push(new BellOnBundlerErrorPlugin());
    return conf;
};
