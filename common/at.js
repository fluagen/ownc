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

    topic: 'topic', //回复话题
    at_reply: 'at_reply', //回复中at
    at_topic: 'at_topic', //话题中at
    follow: 'follow' //关注的话题
};

exports.Type = Type;

var send_topic_message = function(sender, topic, reply, callback) {
    var message = new Message();
    message.sender_id = sender.loginid;
    message.receiver_id = topic.author_id;
    message.topic_id = topic._id;
    message.reply_id = reply._id;
    message.type = Type.topic;
    message.save(callback);
};

var send_at_message = function(text, sender, topic, reply, callback) {
    var receiver_ids = fetchUsers(text);
    if (receiver_ids.length === 0) {
        return callback(null, []);
    }

    receiver_ids = receiver_ids.filter(function(id) {
        return id !== sender.loginid;
    });

    var docs = [];
    var type = Type.at_topic;
    if (reply) {
        type = Type.at_reply;
    }

    receiver_ids.forEach(function(id) {
        var message = {};
        message.sender_id = sender.loginid;
        message.receiver_id = id;
        message.topic_id = topic._id;
        message.reply_id = reply._id;
        message.type = type;
        docs.push(message);
    });

    Message.create(docs, callback);
};


var send_follow_message = function(sender, topic, reply, callback) {
    if (topic.followers.length === 0) {
        return callback(null, []);
    }

    var receiver_ids = _.map(topic.followers, 'id');
    receiver_ids = receiver_ids.filter(function(id) {
        return id !== sender.loginid;
    });
    var docs = [];

    receiver_ids.forEach(function(id) {
        var message = {};
        message.sender_id = sender.loginid;
        message.receiver_id = id;
        message.topic_id = topic._id;
        message.reply_id = reply._id;
        message.type = Type.follow;
        docs.push(message);
    });

    Message.create(docs, callback);
};


exports.sendMessage = function(text, sender, topic, reply, callback) {
    var ep = new EventProxy();
    ep.fail(callback);

    ep.all('topic_message', 'at_message', 'follow_message', function() {
        return callback(null, true);
    });

    send_topic_message(sender, topic, reply, ep.done('topic_message'));

    send_at_message(text, sender, topic, reply, ep.done('at_message'));

    send_follow_message(sender, topic, reply, ep.done('follow_message'));
};
