
var _ = require('lodash');

exports.is_member = function(members, user) {
    if (!user) {
        return false;
    }
    if (!members) {
        members = [];
    }
    var rst = _.some(members, function(o) {
        return o.toString() === user._id.toString();
    });
    return rst;
};