var EventProxy = require('eventproxy');
var model = require('../model');
var Message = model.Message;
var messageRepo = require('../repository/message_repo');


exports.index = function(req, res, next) {
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('messages', function(messages) {
        return res.render('message/index', {
            messages: messages
        });

    });
    Message.find({
        receiver_id: user.loginid
    }, ep.done(function(messages) {
        messageRepo.affixMessages(messages, ep.done('messages'));
    }));
};
