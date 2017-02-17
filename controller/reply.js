var EventProxy = require('eventproxy');
var validator = require('validator');

var model = require('../model');
var Topic = model.Topic;
var User = model.User;
var Reply = model.Reply;
var Message = model.Message;

var at = require('../common/at');
var MessageType = require('../common/message_type');

// var topicManager = require('../manager/topic');
// var replyManager = require('../manager/reply');
// var userManager = require('../manager/user');



exports.add = function(req, res, next) {
    var tid = req.params.tid;
    var content = req.body.r_content;
    var ep = new EventProxy();
    var user = req.session.user;
    ep.fail(next);
    if (tid === undefined || validator.trim(tid) === '') {
        res.render404('话题不存在或已被删除。');
        return;
    }
    if (content === undefined || validator.trim(content) === '') {
        res.render404('回复内容不能为空。');
        return;
    }

    ep.all('reply', 'update_user_reply_count', 'update_topic_last_reply', 'send_at_message', function(reply) {
        res.redirect('/topic/' + tid + '#' + reply._id);
    });

    ep.all('topic', 'topicAuthor', function(topic, topicAuthor) {
        if (!topicAuthor) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        var reply = new Reply();
        reply.topic_id = tid;
        reply.content = content;
        reply.author_id = user._id;
        reply.save(ep.done(function(reply) {
            topic.last_reply_id = reply._id;
            topic.last_reply_author = user.loginid;
            topic.last_reply_at = new Date();
            topic.reply_count += 1;
            topic.save(ep.done('update_topic_last_reply'));

            User.findById(user._id, ep.done(function(u) {
                u.reply_count += 1;
                u.save();
                req.session.user = u;
                ep.emit('update_user_reply_count');
            }));
        }));
        if (topic.author_id.toString() !== user._id.toString()) {
            var message = new Message();
            message.sender_id = user.loginid;
            message.receiver_id = topicAuthor.loginid;
            message.topic_id = topic._id;
            message.reply_id = reply._id;
            message.type = MessageType.Reply;
            message.save();
        }
        var n_content = content.replace('@' + topicAuthor.loginid + ' ', '');
        at.sendMessage(n_content, user._id, topic._id, reply._id, ep.done('send_at_message'));
        ep.emit('reply', reply);
    });
    ep.all('topic', function(topic) {
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        User.findById(topic.author_id, ep.done('topicAuthor'));
    });
    Topic.findById(tid, ep.done('topic'));
};

// exports.delete = function(req, res, next) {
//     var reply_id = req.body.reply_id;
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('reply', function(reply) {
//         if (!reply) {
//             res.render404('删除操作失败，回复记录不存在。');
//             return;
//         }
//         if (reply.author_id.toString() === req.session.user._id.toString() || req.session.user.is_admin) {
//             reply.deleted = true;
//             reply.save(ep.done(function() {
//                 res.redirect('/topic/' + reply.topic_id);
//             }));
//         } else {
//             res.renderError(500, '无效的操作。');
//             return;
//         }

//     });
//     replyManager.getReplyById(reply_id, ep.done('reply'));
// };

// exports.showEdit = function(req, res, next) {
//     var reply_id = req.params.reply_id;
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('reply', function(reply) {
//         if (!reply) {
//             res.render404('此回复不存在或已被删除。');
//             return;
//         }
//         if (req.session.user._id.toString() === reply.author_id.toString()) {
//             res.render('reply/edit', {
//                 reply_id: reply._id,
//                 content: reply.content
//             });
//         } else {
//             res.renderError(500, '你不能编辑此回复。');
//             return;
//         }
//     });
//     replyManager.getReplyById(reply_id, ep.done('reply'));
// };

// exports.update = function(req, res, next) {
//     var reply_id = req.params.reply_id;
//     var content = req.body.r_content;
//     if (content === undefined || validator.trim(content) === '') {
//         res.render404('回复内容不能为空。');
//         return;
//     }
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('reply', function(reply) {
//         if (!reply) {
//             res.render404('此回复不存在或已被删除。');
//             return;
//         }
//         reply.content = content;
//         reply.save();
//         res.redirect('/topic/' + reply.topic_id + '#' + reply_id);
//     });
//     replyManager.getReplyById(reply_id, ep.done('reply'));

// };

exports.up = function(req, res, next) {
    var reply_id = req.params.reply_id;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('reply', function(reply) {
        if (reply.author_id.equals(user._id)) {
            return res.send({
                success: false,
                message: '不能给自己点赞。',
            });
        }
        var action;
        reply.ups = reply.ups || [];
        var upIndex = reply.ups.indexOf(user._id);
        if (upIndex === -1) {
            reply.ups.push(user._id);
            action = 'up';
        } else {
            reply.ups.splice(upIndex, 1);
            action = 'down';
        }
        reply.save(function() {
            res.send({
                success: true,
                action: action
            });
        });

    });
    Reply.findById(reply_id, ep.done('reply'));
};