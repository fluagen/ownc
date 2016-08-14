var model = require('../model');
var Qun = model.Qun;
var Message = model.Message;
var EventProxy = require('eventproxy');
var MessageType = require('./message_type');
var _ = require('lodash');

exports.join = function(sender_id, qun, callback) {
    callback = callback || _.noop;
    var ep = new EventProxy();
    ep.fail(callback);
    var admins = [];
    if (qun.admin_ids) {
        admins = qun.admin_ids;
    }
    admins.push(qun.creator_id);

    ep.after('message', admins.length, function() {
        return callback(null, true);
    });
    admins.forEach(function(id) {
        var message = new Message();
        message.receiver_id = id;
        message.sender_id = sender_id;
        message.qun_id = qun.id;
        message.type = MessageType.Apply.Qun.join;
        message.save(ep.done('message'));
    });
};

exports.pass = function(sender_id, receiver_id, qun, callback) {
    callback = callback || _.noop;
    var ep = new EventProxy();
    ep.fail(callback);

    ep.all('messages', function(messages) {
        if (!messages || messages.length === 0) {
            return callback();
        }
        messages.forEach(function(message) {
            message.has_read = true;
            message.save();
        });
        var msg = new Message();
        msg.sender_id = sender_id;
        msg.receiver_id = receiver_id;
        msg.qun_id = qun.id;
        msg.type = MessageType.Apply.Qun.pass;
        msg.save();

        //add qun member
        qun.members = qun.members.push(receiver_id);

    });
    Message.find({
        'sender_id': receiver_id,
        'qun_id': qun.id,
        'type': MessageType.Apply.Qun.join
    }, ep.done('messages'));
};

exports.refuse = function(sender_id, receiver_id, qun, callback) {
    callback = callback || _.noop;
    var ep = new EventProxy();
    ep.fail(callback);

    ep.all('messages', function(messages) {
        if (!messages || messages.length === 0) {
            return callback();
        }
        messages.forEach(function(message) {
            message.has_read = true;
            message.save();
        });
        var msg = new Message();
        msg.sender_id = sender_id;
        msg.receiver_id = receiver_id;
        msg.qun_id = qun.id;
        msg.type = MessageType.Apply.Qun.refuse;
        msg.save();

    });
    Message.find({
        'sender_id': receiver_id,
        'qun_id': qun.id,
        'type': MessageType.Apply.Qun.join
    }, ep.done('messages'));
};