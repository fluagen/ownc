var EventProxy = require('eventproxy');
var validator = require('validator');

var model = require('../model');
var Group = model.Group;
var Topic = model.Topic;

var topicRepo = require('../repository/topic_repo');

exports.index = function(req, res, next) {
    var group_id = req.params.group_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('group', 'topics', function(group, topics) {
        res.render('group/index', {
            group: group,
            topics: topics
        });
    });
    Group.findOne({
        'id': group_id
    }, ep.done('group'));
    Topic.find({
            'group_id': group_id
        })
        .sort('-last_reply_at -create_at')
        .exec(ep.done(function(topics) {
            topicRepo.affixTopics(topics, ep.done('topics'));
        }));
};
exports.create = function(req, res, next) {
    res.render('group/edit');
};

exports.put = function(req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var bio = req.body.bio;
    var ep = new EventProxy();
    ep.fail(next);

    if (id !== undefined) {
        id = validator.trim(id);
    }
    if (name !== undefined) {
        name = validator.trim(name);
    }
    if (bio !== undefined) {
        bio = validator.trim(bio);
    }
    var error;
    if (!id) {
        error = "组ID不能为空";
    } else if (!name) {
        error = "组名称不能为空";
    }
    if (error) {
        return res.render('group/edit', {
            id: title,
            name: content,
            bio: bio,
            error: error
        });
    }
    var group = new Group();
    group.id = id;
    group.name = name;
    group.bio = bio;

    ep.all('group', function(group) {
        return res.redirect('/go/' + group.id);
    });
    group.save(ep.done('group'));
};