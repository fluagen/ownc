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
require('./topic');
require('./reply');
require('./user');
require('./message');
require('./topic_collect');
require('./topic_follow');
require('./qun');
require('./invitation');
require('./group');

exports.Group = mongoose.model('Group');
exports.Topic = mongoose.model('Topic');
exports.Reply = mongoose.model('Reply');
exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.TopicCollect = mongoose.model('TopicCollect');
exports.TopicFollow = mongoose.model('TopicFollow');
exports.Qun = mongoose.model('Qun');
exports.Invitation = mongoose.model('Invitation');
exports.Groups = mongoose.model('Group');



