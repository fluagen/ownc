var EventProxy = require('eventproxy');
var model = require('../model');
var Community = model.Community;
var topicManager = require('../manager/topic');
var _ = require('lodash');



exports.index = function(req, res, next) {
    var cid = req.params.cid;
    var ep = new EventProxy();
    ep.fail(next);
    var user = req.session.user;
    if (!user) {
        user = {
            _id: 'anonymous'
        };
    }

    ep.all('community', 'topics', function(community, topics) {
        res.render('community/index', {
            topics: topics,
            community: community
        });
    });

    ep.all('community', function(community) {
        if (!community) {
            res.render404('社区不存在或已被删除。');
            return;
        }
        var query = {
            'community_id': cid
        };
        var members = community.members ? community.members : [];
        var index = _.indexOf(members, user._id);
        if (index === -1) {
            query.opened = true;
        }

        var opt = {
            sort: '-top -last_reply_at'
        };
        topicManager.getFullTopicsByQuery(query, opt, ep.done('topics'));
    });

    Community.findOne({
        _id: cid
    }, ep.done('community'));
};

exports.cards = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('communities', function(communities) {
        res.render('community/cards', {
            communities: communities
        });
    });

    Community.find({}, ep.done('communities'));
};

exports.profile = function(req, res, next) {
    var cid = req.params.cid;

    var ep = new EventProxy();
    ep.fail(next);
    ep.all('community', function(community) {
        if (!community) {
            res.render404('社区不存在或已被删除。');
            return;
        }
        res.render('community/profile', {
            community: community
        });
    });
    Community.findById(cid, ep.done('community'));
};

exports.create = function(req, res, next) {
    res.render('community/edit');
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var bio = req.body.bio;
    var user = req.session.user;

    var community = new Community();
    community.name = name;
    community.bio = bio;
    community.creator_id = user._id;
    community.members = [user._id];


    var ep = new EventProxy();
    ep.fail(next);
    ep.all('save', function(obj) {
        res.redirect('community/profile/' + obj._id);
    });

    community.save(ep.done('save'));

};