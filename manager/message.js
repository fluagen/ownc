var model = require('../model');
var Message = model.Message;
var EventProxy = require('eventproxy');

var userManager = require('./user');
var topicManager = require('./topic');
var replyManager = require('./reply');


/*
 * type:
 *
 * reply 			xx 回复了你的话题
 * at_topic 		xx 在话题中提到了你
 * at_reply 		xx 在话题中回复了你
 * apply_group      xx 请求加入 xx组
 * apply_group_ok   xx 申请加入 xx组 的请求通过
 * apply_group_no   xx 申请加入 xx组 的请求被拒绝
 */
var i18n = {
	'reply': '回复了你的话题',
	'at_topic': '在话题中提到了你',
	'at_reply': '在话题中回复了你'

};
var getHeader = function(type){
    var str = i18n[type];
    return str ? str : '';
};

exports.getMessages = function(receiverId, callback) {
    var ep = new EventProxy();
    ep.fail(callback);

    ep.all('messages', function(messages) {
        if (!messages || messages.length === 0) {
            return callback(null, []);
        }
        ep.after('additional_message', messages.length, function() {
            return callback(null, messages);
        });
        messages.forEach(function(msg) {
            var proxy = new EventProxy();
            proxy.fail(callback);
            proxy.all('sender', 'topic', 'reply', function(sender, topic, reply) {
            	msg.heander = getHeader(msg.type);
                msg.sender = sender;
                msg.topic = topic;
                msg.reply = reply;
                ep.emit('additional_message');
            });
            userManager.getUserById(msg.sender_id, proxy.done('sender'));
            topicManager.getTopicById(msg.topic_id, proxy.done('topic'));
            replyManager.getReplyById(msg.reply_id, proxy.done('reply'));
        });

    });
    Message.find({
        receiver_id: receiverId
    }, null, {
        sort: '-create_at'
    }, ep.done('messages'));
};