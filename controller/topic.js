var EventProxy = require('eventproxy');
var validator = require('validator');

var topicManager = require('../manager/topic');
var userManager = require('../manager/user');
var replyManager = require('../manager/reply');

var model = require('../model');
var TopicCollect = model.TopicCollect;
var TopicFollow = model.TopicFollow;

exports.index = function(req, res, next) {
    var is_uped = function(user, reply) {
        if (!reply.ups) {
            return false;
        }
        return reply.ups.indexOf(user._id) !== -1;
    };
    var tid = req.params.tid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topic', 'replies', function(topic, replies) {
        if (!replies) {
            replies = [];
        } else {
            topic.lastReply = replies[replies.length - 1];
        }

        res.render('topic/index', {
            topic: topic,
            replies: replies,
            is_uped: is_uped
        });
    });
    ep.all('topic', function(topic) {
        replyManager.getFullRepliesByTopicId(topic._id, ep.done('replies'));
    });
    topicManager.getFullTopicById(tid, ep.done(function(topic) {
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        topic.visit_count += 1;
        topic.save();
        ep.emit('topic', topic);
    }));
};

exports.create = function(req, res, next) {
    res.render('topic/edit');
};

exports.put = function(req, res, next) {
    var title = req.body.title;
    var content = req.body.t_content;
    var group_id = req.body.group_id;
    var ep = new EventProxy();
    ep.fail(next);
    if (title !== undefined) {
        title = validator.trim(title);
    }
    if (content !== undefined) {
        content = validator.trim(content);
    }
    //TODO 验证group权限

    ep.all('prop_error', function(error) {
        res.render('topic/edit', {
            title: title,
            content: content,
            error: error
        });
    });
    if (!title) {
        ep.emit('prop_error', '标题不能为空');
        return;
    }
    if (title.length > 140) {
        ep.emit('prop_error', '标题不能大于140字数');
        return;
    }

    ep.all('topic', 'user_updated', function(topic) {
        return res.redirect('/topic/' + topic._id);
    });

    topicManager.save(title, content, req.session.user._id, null, false, ep.done(function(topic) {
        userManager.getUserById(req.session.user._id, ep.done(function(user) {
            user.topic_count += 1;
            user.save();
            req.session.user = user;
            ep.emit('user_updated');
        }));
        ep.emit('topic', topic);
    }));
};

exports.collect = function(req, res, next) {
    var topic_id = req.params.topic_id;
    var user_id = req.session.user.user_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('action', function(action) {
        console.log(action);
        return res.send({
            success: true,
            action: action
        });
    });
    ep.all('topic_collect', function(topic_collect) {
        if (topic_collect) {
            topic_collect.remove(ep.done(function(){
                ep.emit('action', 'cancel');
            }));
        } else {
            var tc = new TopicCollect();
            tc.user_id = user_id;
            tc.topic_id = topic_id;
            tc.save(ep.done(function(){
                ep.emit('action', 'bookmark');
            }));
        }
    });
    TopicCollect.findOne({
        user_id: user_id,
        topic_id: topic_id
    }, ep.done('topic_collect'));

};

exports.follow = function(req, res, next) {
    var topic_id = req.params.topic_id;
    var user_id = req.session.user.user_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('action', function(action) {
        console.log(action);
        return res.send({
            success: true,
            action: action
        });
    });
    ep.all('topic_follow', function(topic_follow) {
        if (topic_follow) {
            topic_follow.remove(ep.done(function(){
                ep.emit('action', 'cancel');
            }));
        } else {
            var tf = new TopicFollow();
            tf.user_id = user_id;
            tf.topic_id = topic_id;
            tf.save(ep.done(function(){
                ep.emit('action', 'follow');
            }));
        }
    });
    TopicFollow.findOne({
        user_id: user_id,
        topic_id: topic_id
    }, ep.done('topic_follow'));
};