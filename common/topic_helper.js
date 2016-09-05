var EventProxy = require('eventproxy');
var model = require('../model');
var Topic = model.Topic;
var User = model.User;

var replyHelper = require('./reply_helper');

var affix = function(topic, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!topic) {
        return callback(null, null);
    }
    ep.all('author', 'lastReply', 'qun', function(author, lastReply, qun) {
        //增加附加属性
        topic.author = author;
        topic.lastReply = lastReply;
        topic.qun = qun;

        return callback(null, topic);
    });
    //作者
    User.findById(topic.author_id, ep.done('author'));
    //回复
    replyHelper.affixReply(topic.last_reply, ep.done('lastReply'));
    //群
    Qun.findById(topic.qun_id, ep.done('qun'));
};

exports.affixTopic = function(id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('topic', function(affixTopic) {
        return callback(null, affixTopic);
    });
    Topic.findById(id, ep.done(function(topic) {
        if (!topic) {
            return ep.emit('topic', null);
        }
        affix(topic, ep.done('topic'));
    }));
};

exports.affixTopics = function(query, opt, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('topics', function(topics) {
        if (!topics || topics.length === 0) {
            return callback(null, []);
        }
        ep.after('affix', topics.length, function(topics) {
            return callback(null, topics);
        });
        //遍历 增加附加属性
        topics.forEach(function(topic, i) {
            affix(topic, ep.done('affix'));
        });
    });
    Topic.find(query, {}, opt, ep.done('topics'));
};