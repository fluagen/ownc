var model = require('../model');
var Reply = model.Reply;
var EventProxy = require('eventproxy');
var userManager = require('./user');

exports.getRepliesByTopicId = function(topicId, callback) {
    Reply.find({
        topic_id: topicId
    }, callback);
};
exports.getReplyById = function(id, callback) {
    Reply.findOne({
        _id: id
    }, callback);
};

exports.getFullRepliesByTopicId = function(topicId, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('replies', function(replies) {
        if (!replies || replies.length === 0) {
            return callback(null, []);
        }
        ep.after('full_reply', replies.length, function() {
            return callback(null, replies);
        });
        replies.forEach(function(reply, i) {
            var proxy = new EventProxy();
            proxy.fail(callback);
            proxy.all('author', function(author) {
                reply.author = author;
                ep.emit('full_reply');
            });
            userManager.getUserById(reply.author_id, proxy.done('author'));
        });
    });
    Reply.find({
        topic_id: topicId
    }, ep.done('replies'));
};

exports.getFullReplyById = function(id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('reply', 'author', function(reply, author) {
        if (!reply || !author) {
            return callback(null, null);
        }
        reply.author = author;
        return callback(null, reply);
    });
    ep.all('reply', function(reply) {
        if (!reply) {
            return callback(null, null);
        }
        userManager.getUserById(reply.author_id, ep.done('author'));
    });
    Reply.findOne({
        _id: id
    }, ep.done('reply'));
};

exports.getLastReplyByTopId = function (topicId, callback) {
  Reply.find({topic_id: topicId, deleted: false}, '_id', {sort: {create_at : -1}, limit : 1}, callback);
};

exports.save = function(topicId, content, authorId, callback) {
    var reply = new Reply();
    reply.topic_id = topicId;
    reply.content = content;
    reply.author_id = authorId;
    reply.save(callback);
};