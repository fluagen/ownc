var EventProxy = require('eventproxy');
var model = require('../model');
var Topic = model.Topic;
var User = model.User;
var Qun = model.Qun;
var Group = model.Group;

var _ = require('lodash');

var replyHelper = require('./reply_helper');

exports.affixTopic = function(topic) {
    var ep = new EventProxy();
    ep.fail(_.noop);
    if (!topic) {
        return;
    }
    ep.all('author', 'lastReply', 'group', function(author, lastReply, group) {
        //增加附加属性
        topic.author = author;
        topic.lastReply = lastReply;
        topic.group = group;
        return;
    });
    //作者
    User.findById(topic.author_id, ep.done('author'));
    //回复
    replyHelper.affixReply(topic.last_reply, ep.done('lastReply'));

    Group.findOne(topic.group_id, ep.done('group'));
};

exports.affixTopics = function(topics) {
    if (!topics || topics.length === 0) {
        return;
    }
    //遍历 增加附加属性
    topics.forEach(function(topic, i) {
        affixTopic(topic);
    });
};

exports.affixQunTopic = function(topic) {
    var ep = new EventProxy();
    ep.fail(_.noop);
    if (!topic) {
        return;
    }
    ep.all('author', 'lastReply', 'qun', function(author, lastReply, qun) {
        //增加附加属性
        topic.author = author;
        topic.lastReply = lastReply;
        topic.qun = qun;
        return;
    });
    //作者
    User.findById(topic.author_id, ep.done('author'));
    //回复
    replyHelper.affixReply(topic.last_reply, ep.done('lastReply'));
    //群
    Qun.findById(topic.qun_id, ep.done('qun'));
};

exports.affixQunTopics = function(topics) {
    if (!topics || topics.length === 0) {
        return;
    }
    //遍历 增加附加属性
    topics.forEach(function(topic, i) {
        affixQunTopic(topic);
    });
};