var EventProxy = require('eventproxy');
var validator = require('validator');

var topicManager = require('../manager/topic');
var replyManager = require('../manager/reply');
var userManager = require('../manager/user');
var message = require('../common/message');



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
    ep.all('reply_saved', 'topic_updated', 'user_updated', 'sendReplyMessage', function(reply) {
        res.redirect('/topic/' + tid + '#' + reply._id);
    });


    ep.all('topic', function(topic) {
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        replyManager.save(tid, content, req.session.user._id, ep.done(function(reply) {
            topicManager.updateLastReply(tid, reply._id, ep.done('topic_updated'));
            userManager.getUserById(req.session.user._id, ep.done(function(user) {
                user.reply_count += 1;
                user.save(ep.done(function(user) {
                    req.session.user = user;
                    ep.emit('user_updated');
                }));
                if (topic.author_id !== req.session.user._id) {
                    // send message to topic author
                    message.sendReplyMessage(topic.author_id, req.session.user._id, topic._id, reply._id, ep.done('sendReplyMessage'));
                } else {
                    ep.emit('sendReplyMessage');
                }
            }));
            ep.emit('reply_saved', reply);
        }));
    });
    topicManager.getTopicById(tid, ep.done('topic'));
};