var EventProxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');

var model = require('../model');
var Qun = model.Qun;
var Topic = model.Topic;
var User = model.User;
var topicManager = require('../manager/topic');

var tools = require('../common/tools');
var apply = require('../common/apply_qun');


exports.list = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('quns', function(quns) {
        console.log(quns.length);
        res.render('qun/list', {
            quns: quns
        });
    });

    Qun.find({}, ep.done('quns'));
};

exports.index = function(req, res, next) {
    var qid = req.params.qid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('qun', 'topics', function(qun, topics) {
        res.render('qun/index', {
            topics: topics,
            qun: qun
        });
    });

    ep.all('qun', function(qun) {
        var query = {
            'qun_id': qid,
            'deleted': false
        };
        var opt = {
            sort: '-top -last_reply_at'
        };
        if (!qun.is_member) {
            query.opened = true;
        }
        topicManager.getFullTopics(query, opt, ep.done('topics'));
    });

    Qun.findOne({
        id: qid
    }, ep.done(function(qun) {
        if (!qun) {
            res.render404('群不存在或已被删除。');
            return;
        }
        qun.is_member = tools.is_member(qun.members, user);
        ep.emit('qun', qun);
    }));
};

exports.create = function(req, res, next) {
    res.render('qun/edit');
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var qid = req.body.qid;
    var bio = req.body.bio;
    var user = req.session.user;

    var qun = new Qun();
    qun.name = name;
    qun.id = qid;
    qun.bio = bio;
    qun.opened = false;
    qun.creator_id = user.loginid;
    qun.members = [user.loginid];


    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        res.redirect('/qun/' + qun.id);
    });
    qun.save(ep.done('qun'));
};

exports.createTopic = function(req, res, next) {
    var qid = req.params.qid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        res.render('topic/edit', {
            qun: qun
        });
    });

    Qun.findOne({
        id: qid
    }, ep.done('qun'));
};

exports.putTopic = function(req, res, next) {
    var title = req.body.title;
    var content = req.body.t_content;
    var qid = req.params.qid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topic', 'user_update', 'qun_update', function(topic) {
        return res.redirect('/topic/' + topic._id);
    });

    ep.all('validate_fail', 'qun', function(rst, qun) {
        return res.render('topic/edit', {
            title: title,
            content: content,
            qun: qun,
            error: rst.error
        });
    });

    ep.all('validate_success', function() {
        var user = req.session.user;
        var topic = new Topic();
        topic.title = title;
        topic.content = content;
        topic.author_id = user._id;
        topic.q_id = qid;
        topic.opened = false;
        topic.save(ep.done(function(topic) {
            User.findById(user._id, ep.done(function(user) {
                user.topic_count += 1;
                user.save();
                req.session.user = user;
                ep.emit('user_update');
            }));
            Qun.findOne({
                'id': qid
            }, ep.done(function(qun) {
                qun.topic_count += 1;
                qun.save();
                ep.emit('qun_update');
            }));
            ep.emit('topic', topic);
        }));
    });

    if (title !== undefined) {
        title = validator.trim(title);
    }
    if (content !== undefined) {
        content = validator.trim(content);
    }

    var rst = tools.validateTopicTitle(title);
    if (rst.success) {
        ep.emit('validate_success');
    } else {
        ep.emit('validate_fail', rst);
    }

    Qun.findOne({
        'id': qid
    }, ep.done(function(qun) {
        if (!qun) {
            return res.render404('群不存在或已被删除。');
        }
        ep.emit('qun', qun);
    }));

};

exports.apply = function(req, res, next) {
    var qid = req.params.qid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('qun', function(qun) {
        if (!qun) {
            return res.status(404);
        }
        apply.join(user.loginid, qun, ep.done(function(rst) {
            var message = '申请加入成功';
            if (!rst) {
                message = '申请加入失败';
            }
            return res.send({
                success: rst,
                message: message
            });
        }));
    });

    Qun.findOne({
        'id': qid
    }, ep.done(function(qun) {
        if (!qun) {
            return res.render404('群不存在或已被删除。');
        }
        ep.emit('qun', qun);
    }));
};