'use strict';

module.exports = function(context, callback) {

    var battle = {
        allow2: context.allow2
    };

    battle.blocked = function(user, callback) {

    };

    battle.teardown = function(callback) {
        callback(null);
    };

    return callback(null, battle);
};
