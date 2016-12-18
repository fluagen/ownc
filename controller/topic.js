var EventProxy = require('eventproxy');
var validator = require('validator');

var tools = require('../common/tools');

var topicManager = require('../manager/topic');
var userManager = require('../manager/user');
var replyManager = require('../manager/reply');

var model = require('../model');
var TopicCollect = model.TopicCollect;
var TopicFollow = model.TopicFollow;
var Qun = model.Qun;
var Topic = model.Topic;
var User = model.User;

var is_uped = function(user, reply) {
    if (!reply.ups) {
        return false;
    }
    return reply.ups.indexOf(user._id) !== -1;
};

exports.index = function(req, res, next) {

    var tid = req.params.tid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topic', 'replies', 'is_collected', 'is_followed', function(topic, replies, is_collected, is_followed) {
        if (!replies) {
            replies = [];
        } else {
            topic.lastReply = replies[replies.length - 1];
        }
        res.render('topic/index', {
            topic: topic,
            replies: replies,
            is_uped: is_uped,
            is_collected: is_collected,
            is_followed: is_followed
        });
    });

    topicManager.getFullTopic(tid, ep.done(function(topic) {
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }
        topic.visit_count += 1;
        topic.save();

        replyManager.getFullReplies(topic._id, ep.done('replies'));

        ep.emit('topic', topic);
    }));
    var user = req.session.user;
    if (user) {
        TopicCollect.findOne({
            user_id: user._id,
            topic_id: tid
        }, ep.done('is_collected'));

        TopicFollow.findOne({
            user_id: user._id,
            topic_id: tid
        }, ep.done('is_followed'));
    } else {
        ep.emit('is_collected', null);
        ep.emit('is_followed', null);
    }
};

exports.create = function(req, res, next) {
    res.render('topic/edit');
};

var check = function(title) {
    var rst;
    if (!title) {
        rst = "标题不能为空";
    } else if (title.length > 140) {
        rst = "标题不能大于140字数";
    }
    return rst;
};

exports.put = function(req, res, next) {
    var title = req.body.title;
    var content = req.body.t_content;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);

    if (title !== undefined) {
        title = validator.trim(title);
    }
    if (content !== undefined) {
        content = validator.trim(content);
    }
    var error;
    if (!title) {
        error = "标题不能为空";
    } else if (title.length > 140) {
        error = "标题不能大于140字数";
    }
    if (error) {
        return res.render('topic/edit', {
            title: title,
            content: content,
            error: error
        });
    }

    ep.all('topic', function(topic) {
        return res.redirect('/topic/' + topic._id);
    });


    var topic = new Topic();
    topic.title = title;
    topic.content = content;
    topic.author_id = user._id;
    topic.save(ep.done(function(topic) {
        User.findById(user._id, ep.done(function(user) {
            user.topic_count += 1;
            user.save();
            req.session.user = user;
        }));
        ep.emit('topic', topic);
    }));
};

exports.collect = function(req, res, next) {
    var topic_id = req.params.tid;
    var user_id = req.session.user._id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('action', function(action) {
        return res.send({
            success: true,
            action: action
        });
    });
    ep.all('topic', 'topic_collect', function(topic, topic_collect) {
        if (topic_collect) {
            topic_collect.remove(ep.done(function() {
                topic.collect_count -= 1;
                topic.save();
                ep.emit('action', 'cancel');
            }));
        } else {
            var tc = new TopicCollect();
            tc.user_id = user_id;
            tc.topic_id = topic_id;
            tc.save(ep.done(function() {
                topic.collect_count += 1;
                topic.save();
                ep.emit('action', 'bookmark');
            }));
        }
    });
    TopicCollect.findOne({
        user_id: user_id,
        topic_id: topic_id
    }, ep.done('topic_collect'));
    Topic.findById(topic_id, ep.done('topic'));
};

exports.follow = function(req, res, next) {
    var topic_id = req.params.tid;
    var user_id = req.session.user._id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('action', function(action) {
        return res.send({
            success: true,
            action: action
        });
    });
    ep.all('topic', 'topic_follow', function(topic, topic_follow) {
        if (topic_follow) {
            topic_follow.remove(ep.done(function() {
                topic.follow_count -= 1;
                topic.save();
                ep.emit('action', 'cancel');
            }));
        } else {
            var tf = new TopicFollow();
            tf.user_id = user_id;
            tf.topic_id = topic_id;
            tf.save(ep.done(function() {
                topic.follow_count += 1;
                topic.save();
                ep.emit('action', 'follow');
            }));
        }
    });
    TopicFollow.findOne({
        user_id: user_id,
        topic_id: topic_id
    }, ep.done('topic_follow'));
    Topic.findById(topic_id, ep.done('topic'));
};