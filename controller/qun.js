var EventProxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');

var model = require('../model');
var Qun = model.Qun;
var Topic = model.Topic;
var User = model.User;
var Message = model.Message;
var Invitation = model.Invitation;

var topicRepo = require('../repository/topic_repo');
var replyRepo = require('../repository/reply_repo');
var qunRepo = require('../repository/qun_repo');

var apply = require('../common/apply_qun');


var shortid = require('shortid');
//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');



// exports.list = function(req, res, next) {
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('quns', function(quns) {
//         res.render('qun/list', {
//             quns: quns
//         });
//     });

//     Qun.find({}, ep.done('quns'));
// };

// var popular = function(callback) {
//     var ep = new EventProxy();
//     ep.fail(callback);
//     ep.all('quns', function(quns) {
//         if (!quns) {
//             return callback(null, []);
//         }
//         return callback(null, quns);
//     });
//     Qun.find({}, {}, {
//         sort: '-topic_count -members.length'
//     }, ep.done('quns'));

// };

// var recent = function(callback) {
//     var ep = new EventProxy();
//     ep.fail(callback);
//     ep.all('quns', function(quns) {
//         if (!quns) {
//             return callback(null, []);
//         }
//         return callback(null, quns);
//     });
//     Qun.find({}, {}, {
//         sort: '-create_at'
//     }, ep.done('quns'));
// };

// exports.explore = function(req, res, next) {
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('topics', 'popular', 'recent', function(topics, popular, recent) {
//         if (!topics) {
//             topics = [];
//         }
//         res.render('qun/topics', {
//             topics: topics,
//             popular: popular,
//             recent: recent,
//             action: 'explore'
//         });
//     });
//     var query = {
//         'qun_id': {
//             '$ne': null
//         },
//         'opened': true,
//         'deleted': false
//     };
//     var opt = {
//         sort: '-top -last_reply_at'
//     };
//     topicHelper.affixTopics(query, opt, ep.done('topics'));
//     popular(ep.done('popular'));
//     recent(ep.done('recent'));
// };

// exports.follow = function(req, res, next) {
//     var user = req.session.user;
//     if (!user) {
//         return res.redirect('/qun/explore');
//     }
//     var ep = new EventProxy();
//     ep.fail(next);
//     ep.all('topics', 'quns', 'popular', 'recent', function(topics, quns, popular, recent) {
//         return res.render('qun/topics', {
//             topics: topics,
//             quns: quns,
//             popular: popular,
//             recent: recent,
//             action: 'follow'
//         });
//     });
//     ep.all('quns', function(quns) {
//         if (!quns || quns.length === 0) {
//             ep.emit('topics', []);
//             return;
//         }
//         var qun_ids = _.map(quns, '_id');
//         //qun_ids = _.uniq(qun_ids);
//         var query = {
//             'qun_id': {
//                 '$in': qun_ids
//             },
//             'deleted': false
//         };
//         var opt = {
//             sort: '-top -last_reply_at'
//         };
//         topicHelper.affixTopics(query, opt, ep.done('topics'));
//     });
//     Qun.find({
//         'members.id': user.loginid
//     }, ep.done('quns'));
//     popular(ep.done('popular'));
//     recent(ep.done('recent'));
// };

exports.explore = function(req, res, next) {
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        if (!topics) {
            topics = [];
        }
        res.render('qun/explore', {
            topics: topics
        });
    });

    qunRepo.userQuns(user.loginid, ep.done(function(quns) {

        if (!quns || quns.length === 0) {
            ep.emit('topics', []);
        }
        var qids = _.map(quns, 'id');
        Topic.find({
                'qun_id': {
                    $in: qids
                },
                'deleted': false
            })
            .sort('-last_reply_at -create_at')
            .exec(ep.done(function(topics) {
                topicRepo.affixTopics(topics, 'qun', ep.done('topics'));
            }));

    }));
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

    // ep.all('qun', function(qun) {
    //     var query = {
    //         'qun_id': qun._id,
    //         'deleted': false
    //     };
    //     var opt = {
    //         sort: '-top -last_reply_at'
    //     };
    //     if (!qun.is_member) {
    //         query.opened = true;
    //     }
    //     topicHelper.affixTopics(query, opt, ep.done('topics'));
    // });

    // Qun.findOne({
    //     'id': qid
    // }, ep.done(function(qun) {
    //     if (!qun) {
    //         res.render404('群不存在或已被删除。');
    //         return;
    //     }
    //     qun.is_member = qunHelper.is_member(qun.members, user);
    //     ep.emit('qun', qun);
    // }));

    Qun.findOne({ 'id': qid }, ep.done('qun'));

    Topic.find({
            'qun_id': qid,
            'deleted': false
        })
        .sort('-last_reply_at -create_at')
        .exec(ep.done(function(topics) {
            topicRepo.affixTopics(topics, '', ep.done('topics'));
        }));
};

exports.create = function(req, res, next) {
    res.render('qun/create');
};

var verify = function(qid, name, callback) {
    var rst;
    if (!qid || qid === '') {
        rst = "ID不能为空";
    } else if (qid === 'create') {
        rst = "ID不合法或已被占用";
    } else if (!name) {
        rst = "名称不能为空";
    } else if (name.length > 15) {
        rst = "名称不能大于15字数";
    }
    if (rst) {
        return callback(null, rst);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('re_qid', 're_name', function(re_qid, re_name) {
        if (re_qid) {
            rst = "ID不合法或已被占用";
        } else if (re_name && re_name.length > 0) {
            rst = "名称已被使用";
        }
        return callback(null, rst);
    });
    Qun.find({
        name: name
    }, ep.done('re_name'));

    Qun.findOne({
        id: qid
    }, ep.done('re_qid'));
};

exports.put = function(req, res, next) {
    var name = req.body.name;
    var bio = req.body.bio;
    var qid = req.body.qid;
    if (qid !== undefined) {
        qid = validator.trim(qid);
    }
    if (name !== undefined) {
        name = validator.trim(name);
    }
    if (bio !== undefined) {
        bio = validator.trim(bio);
    }

    var ep = new EventProxy();
    ep.fail(next);

    ep.all('qun', function(qun) {
        return res.redirect('/qun/' + qun.id);
    });

    ep.all('err', function(err) {
        if (err) {
            return res.render('qun/create', {
                qid: qid,
                name: name,
                bio: bio,
                error: err
            });
        } else {
            var user = req.session.user;
            var qun = new Qun();
            qun.id = qid;
            qun.name = name;
            qun.bio = bio;
            qun.creator_id = user.loginid;
            qun.members.push({
                'id': user.loginid,
                'type': 0
            });
            qun.save(ep.done('qun'));
        }
    });


    verify(qid, name, ep.done('err'));
};

exports.createTopic = function(req, res, next) {
    var qid = req.params.qid;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('qun', function(qun) {
        if (!qun) {
            return res.render404('群不存在或已被删除。');
        }
        res.render('qun_topic/edit', {
            qun: qun
        });
        return;
    });

    Qun.findOne({ id: qid }, ep.done('qun'));
};
exports.putTopic = function(req, res, next) {
    var title = req.body.title;
    var content = req.body.t_content;
    var user = req.session.user;
    var qid = req.params.qid;
    if (!qid) {
        return res.render404('群不存在或已被删除。');
    }
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
        ep.all('qun', function(qun) {
            return res.render('qun_topic/edit', {
                title: title,
                content: content,
                qun: qun,
                error: error
            });
        });
        Qun.findOne({ id: qid }, ep.done('qun'));
        return;
    }



    ep.all('topic', function(topic) {
        return res.redirect('/qun/'+qid+'topic/' + topic._id);
    });

    var topic = new Topic();
    topic.title = title;
    topic.content = content;
    topic.author_id = user._id;
    topic.qun_id = qid;
    topic.save(ep.done(function(topic) {
        User.findById(user._id, ep.done(function(user) {
            user.topic_count += 1;
            user.save();
            req.session.user = user;
        }));
        ep.emit('topic', topic);
    }));
};

exports.topic = function(req, res, next) {
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
            is_uped: is_uped,
            is_collected: false,
            is_followed: false
        });
    });

    Topic.findById(tid, function(err, topic) {
        if (err) {
            next(err);
            return;
        }
        if (!topic) {
            res.render404('话题不存在或已被删除。');
            return;
        }

        topicRepo.affixQun(topic, ep.done(function(topic) {
            topic.visit_count += 1;
            topic.save();
            ep.emit('topic', topic);
        }));
        replyRepo.affixReplies(tid, ep.done('replies'));
    });
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
        if (qunHelper.is_member(qun.members, user)) {
            return res.send({
                success: false
            });
        }
        invitation.remove();
        qun.members.push({
            'id': user.loginid,
            'type': 2
        });
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
        qid: qid
    }, ep.done('qun'));

};

exports.join = function(req, res, next) {
    var qid = req.params.qid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        if (qunHelper.is_member(qun.members, user)) {
            return res.redirect('/qun/' + qid);
        }
        return res.render('qun/join', {
            qun: qun
        });
    });

    Qun.findOne({
        qid: qid
    }, ep.done('qun'));
};

exports.joinByUrl = function(req, res, next) {

};
