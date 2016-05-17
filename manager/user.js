var model = require('../model');
var User = model.User;
var EventProxy = require('eventproxy');


exports.getUserById = function(id, callback) {
    User.findOne({
        _id: id
    }, callback);
};

exports.save = function(loginid, name, passwd, email, callback) {

    var user = new User();
    user.loginid = loginid;
    user.name = name;
    user.passwd = passwd;
    user.email = email;
    user.save(callback);
};