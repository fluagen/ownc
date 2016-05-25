var EventProxy = require('eventproxy');
var validator = require('validator');

var topicManager = require('../manager/topic');
var replyManager = require('../manager/reply');
var userManager = require('../manager/user');
var message = require('../common/message');
var at = require('../common/at');



exports.add = function(req, res, next) {
    var tid = req.params.tid;
    var content = req.body.r_content;
    var ep = new EventProxy();
    ep.fail(next);
    if (tid === undefined || validator.trim(tid) === '') {
        res.render404('话题不存在或已被删除。');
        return;
    }
    if (content === undefined || validator.trim(content) === '') {
        res.render404('回复内容不能为空。');
        return;
    }
    ep.all('reply_saved', 'topic_update_lastreply', 'user_acc_replycount', 'sendReplyMessage', 'sendAtMessage', function(reply) {
        res.redirect('/topic/' + tid + '#' + reply._id);
    });

    ep.all('topic', 'topicAuthor', function(topic, topicAuthor) {
        if (!topicAuthor) {
            res.render404('话题不存在或已被删除。');
            return;
        }

        replyManager.save(tid, content, req.session.user._id, ep.done(function(reply) {
            topicManager.updateLastReply(tid, reply._id, ep.done('topic_update_lastreply'));
            userManager.getUserById(req.session.user._id, ep.done(function(user) {
                if (!user) { //TODO 重新登陆
                    res.render404('话题不存在或已被删除。');
                    return;
                }
                user.reply_count += 1;
                user.save();
                req.session.user = user;
                ep.emit('user_acc_replycount');
            }));
            if (topic.author_id.toString() !== req.session.user._id.toString()) {
                // send message to topic author
                message.sendReplyMessage(topic.author_id, req.session.user._id, topic._id, reply._id, ep.done('sendReplyMessage'));
            } else {
                ep.emit('sendReplyMessage');
            }
            var n_content = content.replace('@' + topicAuthor.loginid + ' ', '');
            at.sendMessageToMentionUsers(n_content, topic._id, req.session.user._id, reply._id, ep.done('sendAtMessage'));
            ep.emit('reply_saved', reply);
        }));
    });

    ep.all('topic', function(topic) {
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        userManager.getUserById(topic.author_id, ep.done('topicAuthor'));
    });
    topicManager.getTopicById(tid, ep.done('topic'));
};

exports.delete = function(req, res, next) {
    var reply_id = req.body.reply_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('reply', function(reply) {
        if (!reply) {
            res.render404('删除操作失败，回复记录不存在。');
            return;
        }
        if (reply.author_id.toString() === req.session.user._id.toString() || req.session.user.is_admin) {
            reply.deleted = true;
            reply.save(ep.done(function() {
                res.redirect('/topic/' + reply.topic_id);
            }));
        } else {
            res.renderError(500, '无效的操作。');
            return;
        }

    });
    replyManager.getReplyById(reply_id, ep.done('reply'));
};

exports.showEdit = function(req, res, next) {
    var reply_id = req.params.reply_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('reply', function(reply) {
        if (!reply) {
            res.render404('此回复不存在或已被删除。');
            return;
        }
        if (req.session.user._id.toString() === reply.author_id.toString()) {
            res.render('reply/edit', {
                reply_id: reply._id,
                content: reply.content
            });
        } else {
            res.renderError(500, '你不能编辑此回复。');
            return;
        }
    });
    replyManager.getReplyById(reply_id, ep.done('reply'));
};

exports.update = function(req, res, next) {
    var reply_id = req.params.reply_id;
    var content = req.body.r_content;
    if (content === undefined || validator.trim(content) === '') {
        res.render404('回复内容不能为空。');
        return;
    }
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('reply', function(reply) {
        if (!reply) {
            res.render404('此回复不存在或已被删除。');
            return;
        }
        reply.content = content;
        reply.save();
        res.redirect('/topic/' + reply.topic_id + '#' + reply_id);
    });
    replyManager.getReplyById(reply_id, ep.done('reply'));

};