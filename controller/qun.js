var EventProxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');

var model = require('../model');
var Qun = model.Qun;
var Topic = model.Topic;
var User = model.User;
var Message = model.Message;
var topicManager = require('../manager/topic');

var tools = require('../common/tools');
var apply = require('../common/apply_qun');

var Invitation = model.Invitation;
var shortid = require('shortid');
//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


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
            action: 'topic',
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
    res.render('qun/create');
};
var validateQun = function(name, bio, callback) {
    
    var rst;
    if (!name) {
        rst = "名称不能为空";
    } else if (name.length > 15) {
        rst = "名称不能大于15字数";
    }
    if (rst) {
        return callback(null, rst);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('quns', function(quns) {
        if (quns && quns.length > 0) {
            rst = "名称已被使用";
        }
        return callback(null, rst);
    });
    Qun.find({
        name: name
    }, ep.done('quns'));
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var bio = req.body.bio;
    if (name !== undefined) {
        name = validator.trim(name);
    }
    if (bio !== undefined) {
        bio = validator.trim(bio);
    }
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        res.redirect('/qun/' + qun.qid);
    });
    ep.all('validateQun', function(rst) {
        if (rst && rst.length > 0) {
            return res.render('qun/create', {
                name: name,
                bio: bio,
                error: rst
            });
        }
        var user = req.session.user;
        var qun = new Qun();
        qun.qid = qun._id.toString();
        qun.name = name;
        qun.bio = bio;
        qun.opened = false;
        qun.creator_id = user.loginid;
        qun.members = [user.loginid];
        qun.save(ep.done('qun'));
    });
    validateQun(name, bio, ep.done('validateQun'));
};

exports.invitation = function(req, res, next) {
    var qid = req.params.qid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        res.render('qun/index', {
            action: 'invitation',
            qun: qun
        });
    });
    Qun.findOne({
        id: qid
    }, ep.done('qun'));

};

exports.createInvitation = function(req, res, next) {
    var qid = req.params.qid;
    var code = shortid.generate();
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('invitation', function(invitation) {
        return res.send({
            code: invitation.code
        });
    });

    var invitation = new Invitation();
    invitation.code = code;
    invitation.qun_id = qid;
    invitation.save(ep.done('invitation'));
};

exports.checkInvitation = function(req, res, next) {
    var qid = req.params.qid;
    var code = req.body.code;
    var user = req.session.user;

    var ep = new EventProxy();
    ep.fail(next);
    ep.all('invitation', 'qun', function(invitation, qun) {
        if (!invitation || !qun) {
            return res.send({
                success: false
            });
        }
        if (tools.is_member(qun.members, user)) {
            return res.send({
                success: false
            });
        }
        invitation.remove();
        qun.members.push(user.loginid);
        qun.save();
        return res.send({
            success: true
        });
    });

    Invitation.findOne({
        code: code,
        qun_id: qid
    }, ep.done('invitation'));

    Qun.findOne({
        id: qid
    }, ep.done('qun'));

};

exports.join = function(req, res, next) {
    var qid = req.params.qid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        if (tools.is_member(qun.members, user)) {
            return res.redirect('/qun/' + qid);
        }
        return res.render('qun/join', {
            qun: qun
        });
    });

    Qun.findOne({
        id: qid
    }, ep.done('qun'));
};

exports.joinByUrl = function(req, res, next) {

};