var model = require('../model');
var Topic = model.Topic;
var EventProxy = require('eventproxy');
var userManager = require('./user');
var groupManager = require('./group');
var replyManager = require('./reply');



exports.getTopicsByQuery = function(query, opt, callback) {
    query.deleted = false;
    query.author_deleted = false;
    query.group_deleted = false;
    Topic.find(query, {}, opt, callback);
};
exports.getTopicById = function(id, callback) {
    Topic.findOne({
        _id: id
    }, callback);
};

exports.getFullTopicById = function(id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('full_topic', function(topic) {
        if (!topic || !topic.author) {
            return callback(null, null);
        }
        return callback(null, topic);
    });
    ep.all('topic', function(toipic) {
        if (!topic) {
            return callback(null, null);
        }
        var proxy = new EventProxy();
        proxy.fail(callback);
        proxy.all('author', 'group', function(author, group) {
            topic.author = author;
            topic.group = group;
            ep.emit('full_topic', topic);
        });
        userManager.getUserById(topic.author_id, proxy.done('author'));
        groupManager.getGroupById(topic.group_id, proxy.done('group'));

    });
    getTopicById(id, ep.done('topic'));
};

exports.getFullTopicsByQuery = function(query, opt, callback) {

    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('full_topics', function(topics) {
        if (topics) {
            return callback(null, null);
        }
        return callback(null, topics);
    });
    ep.all('topics', function(topics) {
        if (topics) {
            return callback(null, null);
        }
        ep.after('topics_ready', topics.length, function() {
            ep.emit('full_topics', topics);
        });
        topics.forEach(function(topic, i) {
            var proxy = new EventProxy();
            proxy.fail(callback);
            proxy.all('author', 'group', function(author, group) {
                topic.author = author;
                topic.group = group;
                ep.emit('topics_ready');
            });
            userManager.getUserById(topic.author_id, proxy.done('author'));
            groupManager.getGroupById(topic.group_id, proxy.done('group'));
        });
    });
    getTopicsByQuery(query, opt, ep.done('topics'));
};

exports.updateLastReply = function(topicId, replyId, callback) {
    Topic.findOne({
        _id: topicId
    }, function(err, topic) {
        if (err || !topic) {
            return callback(err);
        }
        topic.last_reply = replyId;
        topic.last_reply_at = new Date();
        topic.reply_count += 1;
        topic.save(callback);
    });
};

exports.reduceCount = function(topicId, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('topic', function(topic) {
        topic.reply_count -= 1;
        if (topic.reply_count === 0) {
            topic.last_reply = null;
            topic.last_reply_at = null;
            topic.save();
            return callback(null, topic);
        } else {
            var proxy = new EventPorxy();
            proxy.fail(callback);
            proxy.all('last_reply', function(reply) {
                topic.last_reply = reply._id;
                topic.last_reply_at = reply.create_at;
                topic.save();
                return callback(null, topic);
            });
            replyManager.getLastReplyByTopicId(topicId, proxy.done('last_reply'));
        }
    });
    Topic.findOne({
        _id: topicId
    }, ep.done('topic'));

};

exports.save = function(title, content, author_id, group_id, private, callback) {

    var topic = new Topic();
    topic.title = title;
    topic.content = content;
    topic.author_id = author_id;
    topic.group_id = group_id;
    if (!private) {
        topic.private = false;
    } else {
        topic.private = true;
    }

    topic.save(callback);

};