var bcrypt = require('bcrypt');
var moment = require('moment');
var utility = require('utility');
var _ = require('lodash');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function(date, friendly) {
    date = moment(date);

    if (friendly) {
        return date.fromNow();
    } else {
        return date.format('YYYY-MM-DD HH:mm');
    }

};

exports.validateId = function(str) {
    return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.bhash = function(str, callback) {
    bcrypt.hash(str, 10, callback);
};

exports.bcompare = function(str, hash, callback) {
    bcrypt.compare(str, hash, callback);
};

exports.makeGravatar = function(email) {
    return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48';
};

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