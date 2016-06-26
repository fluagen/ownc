var EventProxy = require('eventproxy');
var messageManager = require('../manager/message');

var i18n = {

};

exports.index = function(req, res, next) {
    var user = req.session.user;
    console.log('======message ctrl=========');
    console.log(user._id);
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('messages', function(messages) {
        if (!messages) {
            messages = [];
        }
        return res.render('message/index', {
            messages: messages
        });
    });
    messageManager.getMessages(user._id, ep.done('messages'));
};