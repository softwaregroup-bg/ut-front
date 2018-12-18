var common = require('./common.config');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = (params) => {
    var conf = common(params);
    conf.bail = true;
    conf.mode = 'production';
    // conf.devtool = 'source-map';
    // conf.optimization.minimize = false;
    // conf.optimization.concatenateModules: false,
    conf.optimization.minimizer = [
        new TerserPlugin({
            terserOptions: {
                keep_classnames: true,
                keep_fnames: true
            }
        })
    ];
    conf.plugins.push(new CompressionPlugin());

    return conf;
};
