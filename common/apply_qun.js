var model = require('../model');
var Organization = model.Organization;
var Message = model.Message;
var EventProxy = require('eventproxy');
var MessageType = require('./message_type');
var _ = require('lodash');

exports.join = function(sender_id, qun, callback) {
    if (!qun || !qun.admin_ids || qun.admin_ids.length === 0) {
        return callback(null, false);
    }
    var ep = new EventProxy();
    ep.fail(callback);
    var admins = qun.admin_ids;
    ep.after('message', admins.length, function() {
        return callback(null, true);
    });
    admins.forEach(function(id) {
        var message = new Message();
        message.receiver_id = id;
        message.sender_id = sender_id;
        message.org_id = org_id;
        message.type = MessageType.Apply.Organization.join;
        message.save(ep.done('message'));
    });
};

exports.pass = function(sender_id, receiver_id, org_id, callback) {
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
        msg.org_id = org_id;
        msg.type = MessageType.Apply.Organization.pass;
        msg.save();

    });
    Message.find({
        'sender_id': receiver_id,
        'org_id': org_id,
        'type': MessageType.Type.Apply.Organization.join
    }, ep.done('messages'));
};

exports.refuse = function(sender_id, receiver_id, org_id, callback) {
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
        msg.org_id = org_id;
        msg.type = MessageType.Apply.Organization.refuse;
        msg.save();

    });
    Message.find({
        'sender_id': receiver_id,
        'org_id': org_id,
        'type': MessageType.Type.Apply.Organization.join
    }, ep.done('messages'));
};