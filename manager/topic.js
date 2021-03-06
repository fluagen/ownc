var model = require('../model');
var Topic = model.Topic;
var EventProxy = require('eventproxy');
var userManager = require('./user');
var replyManager = require('./reply');

var User = model.User;
var Qun = model.Qun;



exports.getFullTopic = function(id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);

    ep.all('topic', 'author', 'qun', function(topic, author, reply, qun) {
        //增加附加属性
        topic.author = author;
        topic.qun = qun;

        return callback(null, topic);
    });
    ep.all('topic', function(topic) {
        if (!topic) {
            return callback(null, null);
        }
        //作者
        User.findById(topic.author_id, ep.done('author'));

        //群
        if (topic.qun_id) {
            Qun.findOne({
                id: topic.qun_id
            }, ep.done('qun'));
        } else {
            ep.emit('qun', null);
        }
    });
    Topic.findById(id, ep.done('topic'));
};

exports.getFullTopics = function(query, opt, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('topics', function(topics) {
        if (!topics || topics.length === 0) {
            return callback(null, []);
        }
        ep.after('topic_each', topics.length, function(topics) {
            return callback(null, topics);
        });
        //遍历 增加附加属性
        topics.forEach(function(topic, i) {
            var proxy = new EventProxy();
            proxy.fail(callback);
            proxy.all('author', 'qun', function(author, qun) {
                topic.author = author;
                topic.qun = qun;
                ep.emit('topic_each', topic);
            });
            //作者
            User.findById(topic.author_id, proxy.done('author'));
            //群
            if (topic.qun_id) {
                Qun.findOne({
                    id: topic.qun_id
                }, proxy.done('qun'));
            } else {
                proxy.emit('qun', null);
            }
        });
    });
    Topic.find(query, {}, opt, ep.done('topics'));
};

// exports.getFullTopicById = function(id, callback) {
//     var ep = new EventProxy();
//     ep.fail(callback);
//     ep.all('full_topic', function(topic) {
//         if (!topic || !topic.author) {
//             return callback(null, null);
//         }
//         return callback(null, topic);
//     });
//     ep.all('topic', function(topic) {
//         if (!topic) {
//             return callback(null, null);
//         }
//         var proxy = new EventProxy();
//         proxy.fail(callback);
//         proxy.all('author', function(author) {
//             topic.author = author;
//             ep.emit('full_topic', topic);
//         });
//         userManager.getUserById(topic.author_id, proxy.done('author'));

//     });
//     Topic.findOne({
//         '_id': id
//     }, ep.done('topic'));
// };

// exports.getFullTopicsByQuery = function(query, opt, callback) {

//     var ep = new EventProxy();
//     ep.fail(callback);
//     ep.all('full_topics', function(topics) {
//         if (!topics) {
//             return callback(null, null);
//         }
//         return callback(null, topics);
//     });
//     ep.all('topics', function(topics) {
//         if (!topics) {
//             return callback(null, null);
//         }
//         ep.after('topics_ready', topics.length, function() {
//             ep.emit('full_topics', topics);
//         });
//         topics.forEach(function(topic, i) {
//             var proxy = new EventProxy();
//             proxy.fail(callback);
//             proxy.all('author', 'lastReply', function(author, lastReply) {
//                 topic.author = author;
//                 topic.lastReply = lastReply;
//                 ep.emit('topics_ready');
//             });
//             userManager.getUserById(topic.author_id, proxy.done('author'));
//             if (topic.last_reply) {
//                 replyManager.getFullReplyById(topic.last_reply, proxy.done('lastReply'));
//             } else {
//                 proxy.emit('lastReply', null);
//             }

//         });
//     });
//     getTopicsByQuery(query, opt, ep.done('topics'));
// };

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
    if (!private) {
        topic.private = false;
    } else {
        topic.private = true;
    }

    topic.save(callback);

};