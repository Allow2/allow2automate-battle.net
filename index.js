var plugin = {};

plugin.onLoad = function(data, callback) {
    console.log('loaded');
    return callback(true);
};

plugin.onUnload = function(data, callback) {
    console.log('unloaded');
    return callback(true);
};

export default plugin;