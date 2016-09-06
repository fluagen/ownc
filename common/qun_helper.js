var _ = require('lodash');

exports.is_member = function(members, user) {
    if (!user) {
        return false;
    }
    if (!members) {
        members = [];
    }
    var rst = _.some(members, function(o) {
        return o.id === user.loginid;
    });
    return rst;
};

exports.is_admin = function(members, user) {
    if (!user) {
        return false;
    }
    if (!members) {
        members = [];
    }
    var rst = _.some(members, function(o) {
        return o.id === user.loginid && (o.type === 0 || o.type === 1);
    });
    return rst;
};