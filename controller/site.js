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
            topics: topics
        });
    });


    Topic.find({
        'qun_id': null,
        'deleted': false
    }).sort('-last_reply_at -create_at').exec(ep.done(function(topics) {
        topicRepo.affixTopics(topics, ep.done('topics'));
    }));
};

