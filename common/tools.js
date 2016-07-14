var bcrypt = require('bcrypt');
var moment = require('moment');
var utility = require('utility');

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

exports.validateTopicTitle = function(title) {
    var rst = {
        success: true,
        error: ''
    };
    if (!title) {
        rst.success = false;
        rst.error = "标题不能为空";
        return rst;
    }
    if (title.length > 140) {
        rst.success = false;
        rst.error = "标题不能大于140字数";
        return rst;
    }
    return rst;
};