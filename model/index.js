var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.db, {
    server: {
        poolSize: 20
    }
}, function(err) {
    if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
    }
});

// models
require('./tnode');
require('./topic');
require('./reply');
require('./user');
require('./message');
require('./topic_collect');
require('./topic_follow');
require('./qun');
require('./qun_member');
require('./invitation');

exports.TNode = mongoose.model('TNode');
exports.Topic = mongoose.model('Topic');
exports.Reply = mongoose.model('Reply');
exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.TopicCollect = mongoose.model('TopicCollect');
exports.TopicFollow = mongoose.model('TopicFollow');
exports.Qun = mongoose.model('Qun');
exports.QunMember = mongoose.model('QunMember');
exports.Invitation = mongoose.model('Invitation');



