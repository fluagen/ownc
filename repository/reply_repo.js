var model = require('../model');
var Reply = model.Reply;
var User = model.User;
var EventProxy = require('eventproxy');

var affix = function(reply, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!reply) {
        return callback(null, null);
    }
    ep.all('author', function(author) {
        //增加附加属性
        reply.author = author;

        return callback(null, reply);
    });
    User.findOne({ loginid: reply.author_id }, ep.done('author'));
};

exports.affixReply = function(id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('reply', function(reply) {
        return callback(null, reply);
    });
    Reply.findById(id, ep.done(function(reply) {
        if (!reply) {
            return callback(null, null);
        }
        affix(reply, ep.done('reply'));
    }));
};

exports.affixReplies = function(topic_id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('replies', function(replies) {
        if (!replies || replies.length === 0) {
            return callback(null, []);
        }
        ep.after('affix', replies.length, function() {
            return callback(null, replies);
        });
        replies.forEach(function(reply, i) {
            affix(reply, ep.done('affix'));
        });
    });
    Reply.find({
        'topic_id': topic_id
    }, ep.done('replies'));
};
