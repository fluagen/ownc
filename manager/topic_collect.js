var model = require('../model');
var Topic = model.Topic;
var TopicCollect = model.TopicCollect;
var EventProxy = require('eventproxy');

exports.getCollectTopics = function(user_id, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    ep.all('topics', function(topics) {
        if (!topics) {
            callback(null, null);
        }
        callback(null, topics);
    });
    TopicCollect.find({
        user_id: user_id
    }, ep.done('topics'));
};
