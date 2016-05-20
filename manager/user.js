var model = require('../model');
var User = model.User;
var EventProxy = require('eventproxy');


exports.getUserById = function(id, callback) {
    User.findOne({
        _id: id
    }, callback);
};

exports.getUserByLoginid = function(loginid, callback) {
    User.findOne({
        loginid: loginid
    }, callback);
};

exports.getUserByEmail = function(email, callback) {
    User.findOne({
        email: email
    }, callback);
};

exports.getUsersByQuery = function(query, opt, callback) {
    User.find(query, {}, opt, callback);
};

exports.getUsersByLoginids = function (loginids, callback) {
  if (loginids.length === 0) {
    return callback(null, []);
  }
  User.find({ loginid: { $in: loginids } }, callback);
};

exports.save = function(loginid, name, passwd, email, callback) {

    var user = new User();
    user.loginid = loginid;
    user.name = name;
    user.passwd = passwd;
    user.email = email;
    user.save(callback);
};