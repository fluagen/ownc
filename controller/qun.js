var EventProxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');

var model = require('../model');
var Qun = model.Qun;
var Topic = model.Topic;
var User = model.User;
var Message = model.Message;
var QunMember = model.QunMember;
var Invitation = model.Invitation;

var topicHelper = require('../common/topic_helper');
var qunHelper = require('../common/qun_helper');
var apply = require('../common/apply_qun');


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

var popular = function(callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('quns', function(quns) {
        if (!quns) {
            return callback(null, []);
        }
        return callback(null, quns);
    });
    Qun.find({}, {}, {
        sort: '-topic_count -members.length'
    }, ep.done('quns'));

};

var recent = function(callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('quns', function(quns) {
        if (!quns) {
            return callback(null, []);
        }
        return callback(null, quns);
    });
    Qun.find({}, {}, {
        sort: '-create_at'
    }, ep.done('quns'));
};

exports.explore = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', 'popular','recent', function(topics, popular, recent) {
        if (!topics) {
            topics = [];
        }
        res.render('qun/topics', {
            topics: topics,
            popular: popular,
            recent: recent,
            action: 'explore'
        });
    });
    var query = {
        'qun_id': {
            '$ne': null
        },
        'opened': true,
        'deleted': false
    };
    var opt = {
        sort: '-top -last_reply_at'
    };
    topicHelper.affixTopics(query, opt, ep.done('topics'));
    popular(ep.done('popular'));
    recent(ep.done('recent'));
};

exports.follow = function(req, res, next) {
    var user = req.session.user;
    if (!user) {
        return res.redirect('/qun/explore');
    }
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', 'quns', 'popular', 'recent', function(topics, quns, popular, recent) {
        return res.render('qun/topics', {
            topics: topics,
            quns: quns,
            popular: popular,
            recent: recent,
            action: 'follow'
        });
    });
    ep.all('quns', function(quns) {
        if (!quns || quns.length === 0) {
            ep.emit('topics', []);
            return;
        }
        var qun_ids = _.map(quns, '_id');
        //qun_ids = _.uniq(qun_ids);
        var query = {
            'qun_id': {
                '$in': qun_ids
            },
            'deleted': false
        };
        var opt = {
            sort: '-top -last_reply_at'
        };
        topicHelper.affixTopics(query, opt, ep.done('topics'));
    });
    Qun.find({
        'members.id': user.loginid
    }, ep.done('quns'));
    popular(ep.done('popular'));
    recent(ep.done('recent'));
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
            'qun_id': qun._id,
            'deleted': false
        };
        var opt = {
            sort: '-top -last_reply_at'
        };
        if (!qun.is_member) {
            query.opened = true;
        }
        topicHelper.affixTopics(query, opt, ep.done('topics'));
    });

    Qun.findOne({
        'qid': qid
    }, ep.done(function(qun) {
        if (!qun) {
            res.render404('群不存在或已被删除。');
            return;
        }
        qun.is_member = qunHelper.is_member(qun.members, user);
        ep.emit('qun', qun);
    }));
};

exports.create = function(req, res, next) {
    res.render('qun/create');
};
var check = function(name, bio, callback) {

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
    ep.all('check', function(rst) {
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
        qun.creator_id = user.loginid;
        qun.members.push({
            'id': user.loginid,
            'type': 0
        });
        qun.save(ep.done('qun'));
    });
    check(name, bio, ep.done('check'));
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
        qid: qid
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