var EventProxy = require('eventproxy');
var model = require('../model');
var Topic = model.Topic;
var User = model.User;

var _ = require('lodash');

var replyRepo = require('./reply_repo');

var affixTopic = function(topic, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!topic) {
        return callback(null, null);
    }
    ep.all('author', 'lastReply', function(author, lastReply) {
        //增加附加属性
        topic.author = author;
        topic.lastReply = lastReply;
        return callback(null, topic);
    });
    //作者
    User.findById(topic.author_id, ep.done('author'));
    //回复
    replyRepo.affixReply(topic.last_reply_id, ep.done('lastReply'));
};

exports.affixTopics = function(topics, callback) {
    if (!topics || topics.length === 0) {

        return callback(null, []);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    ep.after('topics', topics.length, function(topics) {
        callback(null, topics);
        return;
    });

    //遍历 增加附加属性
    topics.forEach(function(topic, i) {
        affixTopic(topic, ep.done('topics'));
    });
};
