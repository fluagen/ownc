var model = require('../model');
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


var Type = {

    reply: 'reply', //回复话题
    at_reply: 'at_reply', //回复中at
    at_topic: 'at_topic', //话题中at
    follow: 'follow' //关注的话题
};

exports.Type = Type;

exports.send_reply_message = function(sender_id, receiver_id, topic_id, reply_id, callback) {
    var message = new Message();
    message.sender_id = sender_id;
    message.receiver_id = receiver_id;
    message.topic_id = topic_id;
    message.reply_id = reply_id;
    message.type = Type.reply;
    message.save(callback);
};

exports.send_at_reply_message = function(text, sender_id, topic_id, reply_id, callback) {
    var receiver_ids = fetchUsers(text);
    if (receiver_ids.length === 0) {
        return callback(null, []);
    }

    receiver_ids = receiver_ids.filter(function(id) {
        return !id.equals(sender_id);
    });

    var docs = [];

    receiver_ids.forEach(function(id) {
        var message = {};
        message.sender_id = sender_id;
        message.receiver_id = id;
        message.topic_id = topic_id;
        message.reply_id = reply_id;
        message.type = Type.at_reply;
        docs.push(message);
    });

    Message.create(docs, callback);
};

exports.send_at_topic_message = function(text, sender_id, topic_id, callback) {
    var receiver_ids = fetchUsers(text);
    if (receiver_ids.length === 0) {
        return callback(null, []);
    }

    receiver_ids = receiver_ids.filter(function(id) {
        return !id.equals(sender_id);
    });

    var docs = [];

    receiver_ids.forEach(function(id) {
        var message = {};
        message.sender_id = sender_id;
        message.receiver_id = id;
        message.topic_id = topic_id;
        message.reply_id = reply_id;
        message.type = Type.at_topic;
        docs.push(message);
    });

    Message.create(docs, callback);
};

exports.send_follow_message = function(sender_id, topic_id, reply_id, callback) {

};


exports.sendMessage = function(text, sender_id, topic_id, reply_id, callback) {
    var loginids = fetchUsers(text);
    if (loginids.length === 0) {
        return callback(null, []);
    }

    loginids = loginids.filter(function(loginid) {
        return !loginid.equals(sender_id);
    });
    var type = Type.at_reply;
    if (!reply_id) {
        type = Type.at_topic;
    }

    var docs = [];


    loginids.forEach(function(loginid) {
        var message = new Message();
        message.sender_id = sender_id;
        message.receiver_id = loginid;
        message.topic_id = topic_id;
        message.reply_id = reply_id;
        message.type = type;
        docs.push(message);
    });

    Message.create(docs, callback);
};
