var model = require('../model');
var User = model.User;
var Qun = model.Qun;
var EventProxy = require('eventproxy');

exports.userQuns = function(user_id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('quns', function(quns) {
        if (!quns) {
            return callback(null, []);
        }
        return callback(null, quns);
    });
    Qun.find({
            'members.id': user_id
        })
        .exec(ep.done('quns'));
};

