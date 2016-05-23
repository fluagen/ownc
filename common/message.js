var models = require('../model');
var eventproxy = require('eventproxy');
var Message = models.Message;
var _ = require('lodash');

/***
 * message type:
 *      reply 话题回复
 *      at_topic 话题中at
 *      at_reply 回复中at
 *      apply_group 请求加入组
 *      apply_group_ok 申请加入组的请求通过
 *      apply_group_no 申请加入组的请求被拒绝
 */

exports.sendReplyMessage = function(receiver_id, sender_id, topic_id, reply_id, callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message = new Message();
    message.type = 'reply';
    message.receiver_id = receiver_id;
    message.sender_id = sender_id;
    message.topic_id = topic_id;
    message.reply_id = reply_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function(msg) {
        callback(null, msg);
    });
};

exports.sendAtMessage = function(receiver_id, sender_id, topic_id, reply_id, callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message = new Message();
    message.type = 'at_reply';
    if (!reply_id) {
        message.type = 'at_topic';
    }
    message.receiver_id = receiver_id;
    message.sender_id = sender_id;
    message.topic_id = topic_id;
    message.reply_id = reply_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function(msg) {
        callback(null, msg);
    });
};

exports.sendGroupMessage = function(receiver_id, sender_id, group_id, type, callback) {
    callback = callback || _.noop;
    var ep = new eventproxy();
    ep.fail(callback);

    var message = new Message();
    message.type = type;
    message.receiver_id = receiver_id;
    message.sender_id = sender_id;
    message.group_id = group_id;

    message.save(ep.done('message_saved'));
    ep.all('message_saved', function(msg) {
        callback(null, msg);
    });
};



