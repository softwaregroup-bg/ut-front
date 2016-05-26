module.exports = function(params, hotReload) {
    return hotReload ? require('./dev.config')(params) : require('./prod.config')(params);
};
