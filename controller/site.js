var EventProxy = require('eventproxy');
var _ = require('lodash');

var model = require('../model');
var Qun = model.Qun;
var Topic = model.Topic;
var topicRepo = require('../repository/topic_repo');

exports.index = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        return res.render('index', {
            topics: topics,
        });
    });


    Topic.find({
        'qun_id': null,
        'deleted': false
    }).sort('-last_reply_at -create_at').exec(ep.done(function(topics) {
        topicRepo.affixTopics(topics, 'group', ep.done('topics'));
    }));
};

exports.follow = function(req, res, next) {
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        return res.render('index', {
            topics: topics,
        });
    });
    ep.all('quns', function(quns) {
        if (!quns || quns.length === 0) {
            ep.emit('topics', []);
            return;
        }
        var qun_ids = _.map(quns, '_id');
        var query = {
            'qun_id': {
                '$in': qun_ids
            },
            'deleted': false
        };
        var opt = {
            sort: '-last_reply_at'
        };
        topicHelper.affixTopics(query, opt, ep.done('topics'));
    });
    Qun.find({
        'members.id': user.loginid
    }, ep.done('quns'));
};

exports.popular = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        return res.render('index', {
            topics: topics
        });
    });
    var query = {
        'opened': true,
        'deleted': false
    };
    var opt = {
        sort: '-reply_count -last_reply_at'
    };
    topicHelper.affixTopics(query, opt, ep.done('topics'));
};