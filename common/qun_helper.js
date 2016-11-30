var _ = require('lodash');
var model = require('../model');
var Qun = model.Qun;
var EventProxy = require('eventproxy');

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

exports.myQuns = function(user_id, callback) {

    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('quns', function(quns) {
        if (!quns) {
            return callback(null, null);
        }
        return callback(null, quns);
    });
    var query = {
        'members.id': user_id
    };
    Qun.find(query).exec(ep.done('quns'));
};