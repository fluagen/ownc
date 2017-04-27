var EventProxy = require('eventproxy');
var model = require('../model');
var Topic = model.Topic;
var Reply = model.Reply;
var User = model.User;

var affix = function(message, callback) {
    var ep = new EventProxy();
    ep.fail(callback);
    if (!message) {
        return callback(null, null);
    }
    ep.all('sender', 'topic', 'reply', function(sender, topic, reply) {
        //附加属性
        message.sender = sender;
        message.topic = topic;
        message.reply = reply;

        return callback(null, message);
    });
    
    User.findOne({loginid: message.sender_id}, ep.done('sender'));

    Topic.findById(message.topic_id, ep.done('topic'));

    Reply.findById(message.reply_id, ep.done('reply'));

};




var affixMessages = function(messages, callback) {
    if (!messages || messages.length === 0) {
        return callback(null, []);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    ep.after('messages', messages.length, function(messages) {
        callback(null, messages);
        return;
    });

    //遍历 增加附加属性
    messages.forEach(function(message, i) {
        affix(message, ep.done('messages'));
    });
};


exports.affix = affix;
exports.affixMessages = affixMessages;
