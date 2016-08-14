var EventProxy = require('eventproxy');
var model = require('../model');
var Message = model.Message;
var User = model.User;
var Qun = model.Qun;
var Topic = model.Topic;
var Reply = model.Reply;
var MessageType = require('../common/message_type');


exports.index = function(req, res, next) {
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('messages', function(messages) {
        if (!messages) {
            messages = [];
        }

        ep.after('additional_message', messages.length, function() {
            return res.render('message/index', {
                messages: messages,
                MessageType: MessageType
            });
        });
        messages.forEach(function(message) {
            var proxy = new EventProxy();
            proxy.fail(next);
            proxy.all('sender', 'receiver', 'qun', 'topic', 'reply', function(sender, receiver, qun, topic, reply) {
                message.sender = sender;
                message.receiver = receiver;
                message.qun = qun;
                message.topic = topic;
                message.reply = reply;
                ep.emit('additional_message');
            });
            User.findOne({
                loginid: message.sender_id
            }, proxy.done('sender'));
            User.findOne({
                loginid: message.receiver_id
            }, proxy.done('receiver'));
            Topic.findById(message.topic_id, proxy.done('topic'));
            Reply.findById(message.reply_id, proxy.done('reply'));
            if (message.qun_id) {
                Qun.findOne({
                    id: message.qun_id
                }, proxy.done('qun'));
            } else {
                proxy.emit('qun', null);
            }

        });

    });
    Message.find({
        receiver_id: user.loginid
    }, ep.done('messages'));
};