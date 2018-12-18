/* eslint no-process-env:0 */
module.exports = function(params, dev = process.env.NODE_ENV !== 'production') {
    return dev ? require('./dev.config')(params) : require('./prod.config')(params);
};
