var model = require('../model');
var User = model.User;
var Message = model.Message;
var MessageType = require('./message_type');
var EventProxy = require('eventproxy');
var _ = require('lodash');
var markdownit = require('./markdownit');
var linkify = markdownit.linkify;

/**
 * 从文本中提取出@username 标记的用户名数组
 * @param {String} text 文本内容
 * @return {Array} 用户名数组
 */
var fetchUsers = function(text) {


    if (!text) {
        return [];
    }
    var names = [];
    var matchs = linkify.match(text);
    var mentions = _.filter(matchs, {
        schema: '@'
    });
    _.map(mentions, function(o) {
        var name = _.replace(o.url, '/user/', '');
        if (name) {
            names.push(name);
        }
    });
    names = _.uniq(names);
    return names;
};
exports.fetchUsers = fetchUsers;


exports.sendMessage = function(text, sender_id, topic_id, reply_id, callback) {
    var loginids = fetchUsers(text);
    if (loginids.length === 0) {
        return callback(null, []);
    }

    loginids = loginids.filter(function(loginid) {
        return !loginid.equals(sender_id);
    });
    var type = MessageType.At.reply;
    if (!reply_id) {
        type = MessageType.At.topic;
    }

    loginids.forEach(function(loginid) {
        var message = new Message();
        message.sender_id = sender_id;
        message.receiver_id = loginid;
        message.topic_id = topic_id;
        message.reply_id = reply_id;
        message.type = type;
        message.save();
    });
};