var EventProxy = require('eventproxy');

var topicManager = require('../manager/topic');
var model = require('../model');
var Organization = model.Organization;

exports.index = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        return res.render('index', {
            topics: topics
        });
    });
    var query = {
        opened: true,
        deleted: false
    };
    var options = {
        sort: '-top -last_reply_at'
    };
    topicManager.getFullTopics(query, options, ep.done('topics'));
};