var EventProxy = require('eventproxy');
var topicManager = require('../manager/topic');

exports.index = function(req, res, next) {
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('topics', function(topics) {
        if (!topics) {
            topics = [];
        }
        res.render('index', {
            topics: topics
        });
    });
    var query = {};
    var options = {
        sort: '-top -last_reply_at'
    };
    topicManager.getFullTopicsByQuery(query, options, ep.done('topics'));
};
