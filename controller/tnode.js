var EventProxy = require('eventproxy');
var validator = require('validator');

var model = require('../model');
var TNode = model.TNode;
var Topic = model.Topic;

var topicRepo = require('../repository/topic_repo');

exports.index = function(req, res, next) {
    var node_id = req.params.node_id;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('node', 'topics', function(node, topics) {
        res.render('tnode/index', {
            node: node,
            topics: topics
        });
    });
    TNode.findOne({
        'id': node_id
    }, ep.done('node'));
    Topic.find({
            'node_id': node_id
        })
        .sort('-last_reply_at -create_at')
        .exec(ep.done(function(topics) {
            topicRepo.affixTopics(topics, ep.done('topics'));
        }));
};
exports.create = function(req, res, next) {
    res.render('tnode/edit');
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
        error = "节点不能为空";
    } else if (!name) {
        error = "节点名称不能为空";
    }
    if (error) {
        return res.render('tnode/edit', {
            id: title,
            name: content,
            bio: bio,
            error: error
        });
    }
    var node = new TNode();
    node.id = id;
    node.name = name;
    node.bio = bio;

    ep.all('node', function(node) {
        return res.redirect('/go/' + node.id);
    });
    node.save(ep.done('node'));
};