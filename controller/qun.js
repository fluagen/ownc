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