var EventProxy = require('eventproxy');
var topicManager = require('../manager/topic');
var model = require('../model');
var Organization = model.Organization;

exports.index = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', 'orgs', function(topics, orgs) {
        if (!topics) {
            topics = [];
        }
        res.render('index', {
            topics: topics,
            orgs: orgs
        });
    });
    var query = {};
    var options = {
        sort: '-top -last_reply_at'
    };
    topicManager.getFullTopicsByQuery(query, options, ep.done('topics'));

    Organization.find({}, ep.done('orgs'));
};
