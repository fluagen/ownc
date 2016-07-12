var EventProxy = require('eventproxy');
var model = require('../model');
var Organization = model.Organization;
var topicManager = require('../manager/topic');
var _ = require('lodash');

exports.cards = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('orgs', function(orgs) {
        res.render('org/cards', {
            orgs: orgs
        });
    });

    Organization.find({}, ep.done('orgs'));
};

exports.index = function(req, res, next) {
    var orgid = req.params.orgid;
    var ep = new EventProxy();
    ep.fail(next);
    var user = req.session.user;
    if (!user) {
        user = {
            _id: 'anonymous'
        };
    }

    ep.all('org', 'topics', function(org, topics) {
        res.render('org/index', {
            topics: topics,
            org: org
        });
    });

    ep.all('org', function(org) {
        if (!org) {
            res.render404('社区不存在或已被删除。');
            return;
        }
        var query = {
            'org_id': orgid
        };
        var members = org.members ? org.members : [];
        var index = _.indexOf(members, user._id);
        if (index === -1) {
            query.opened = true;
        }

        var opt = {
            sort: '-top -last_reply_at'
        };
        topicManager.getFullTopicsByQuery(query, opt, ep.done('topics'));
    });

    Organization.findOne({
        orgid: orgid
    }, ep.done('org'));
};

exports.create = function(req, res, next) {
    res.render('org/edit');
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var orgid = req.body.orgid;
    var bio = req.body.bio;
    var user = req.session.user;

    var organization = new Organization();
    organization.name = name;
    organization.orgid = orgid;
    organization.bio = bio;
    organization.creator_id = user._id;
    organization.members = [user._id];


    var ep = new EventProxy();
    ep.fail(next);
    ep.all('save', function(org) {
        res.redirect('/org/' + org.orgid);
    });

    organization.save(ep.done('save'));

};