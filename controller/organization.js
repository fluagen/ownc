var EventProxy = require('eventproxy');
var validator = require('validator');
var _ = require('lodash');

var model = require('../model');
var Organization = model.Organization;
var Topic = model.Topic;
var User = model.User;
var topicManager = require('../manager/topic');

var tools = require('../common/tools');


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
    var oid = req.params.oid;
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('organization', 'topics', function(organization, topics) {
        res.render('org/index', {
            topics: topics,
            organization: organization
        });
    });

    ep.all('organization', function(organization) {
        var query = {
            'org_id': oid
        };
        var opt = {
            sort: '-top -last_reply_at'
        };
        if (!organization.is_member) {
            query.opened = true;
        }
        topicManager.getFullTopicsByQuery(query, opt, ep.done('topics'));
    });

    Organization.findOne({
        id: oid
    }, ep.done(function(organization) {
        if (!organization) {
            res.render404('社区不存在或已被删除。');
            return;
        }
        organization.is_member = tools.is_member(organization.members, user);
        ep.emit('organization', organization);
    }));
};

exports.create = function(req, res, next) {
    res.render('org/edit');
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var org_id = req.body.org_id;
    var bio = req.body.bio;
    var user = req.session.user;

    var organization = new Organization();
    organization.name = name;
    organization.id = org_id;
    organization.bio = bio;
    organization.creator_id = user._id;
    organization.members = [user._id];


    var ep = new EventProxy();
    ep.fail(next);
    ep.all('save', function(org) {
        res.redirect('/org/' + org.id);
    });

    organization.save(ep.done('save'));

};

exports.createTopic = function(req, res, next) {
    var oid = req.params.oid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('organization', function(organization) {
        res.render('topic/edit', {
            organization: organization
        });
    });

    Organization.findOne({
        id: oid
    }, ep.done('organization'));
};

exports.putTopic = function(req, res, next) {
    var title = req.body.title;
    var content = req.body.t_content;
    var oid = req.params.oid;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topic', 'user_update', 'organization_update', function(topic) {
        return res.redirect('/topic/' + topic._id);
    });

    ep.all('validate_fail', 'organization', function(rst, organization) {
        return res.render('topic/edit', {
            title: title,
            content: content,
            organization: organization,
            error: rst.error
        });
    });

    ep.all('validate_success', function() {
        var user = req.session.user;
        var topic = new Topic();
        topic.title = title;
        topic.content = content;
        topic.author_id = user._id;
        topic.org_id = oid;
        topic.opened = false;
        topic.save(ep.done(function(topic) {
            User.findById(user._id, ep.done(function(user) {
                user.topic_count += 1;
                user.save();
                req.session.user = user;
                ep.emit('user_update');
            }));
            Organization.findOne({
                'id': oid
            }, ep.done(function(organization) {
                organization.topic_count += 1;
                organization.save();
                ep.emit('organization_update');
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

    Organization.findOne({
        'id': oid
    }, ep.done(function(organization) {
        if (!organization) {
            return res.render404('社区不存在或已被删除。');
        }
        ep.emit('organization', organization);
    }));

};