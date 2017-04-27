var EventProxy = require('eventproxy');
var model = require('../model');
var Topic = model.Topic;
var User = model.User;
var Group = model.Group;
var Qun = model.Qun;

var _ = require('lodash');

var affixTopic = function(topic, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!topic) {
        return callback(null, null);
    }
    ep.all('author', 'group', function(author, group) {
        //附加属性
        topic.author = author;
        topic.group = group;
        return callback(null, topic);
    });
    //作者
    User.findOne({loginid: topic.author_id}, ep.done('author'));

    Group.findOne({id: topic.group_id}, ep.done('group'));
};




var affixTopics = function(topics, callback) {
    if (typeof affix === 'function') {
        callback = affix;
        affix = null;
    }
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

var affixQunTopic = function(topic, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!topic) {
        return callback(null, null);
    }
    ep.all('author', 'qun', function(author, qun) {
        //附加属性
        topic.author = author;
        topic.qun = qun;
        return callback(null, topic);
    });
    //作者
    User.findOne({loginid: topic.author_id}, ep.done('author'));

    Qun.findOne({id: topic.qun_id}, ep.done('qun'));
};

var affixQunTopics = function(topics, callback) {
    if (typeof affix === 'function') {
        callback = affix;
        affix = null;
    }
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

exports.affixTopic = affixTopic;
exports.affixTopics = affixTopics;
exports.affixQunTopic = affixQunTopic;
exports.affixQunTopics = affixQunTopics;
