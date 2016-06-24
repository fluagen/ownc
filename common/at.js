/*!
 * nodeclub - topic mention user controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var userManager = require('../manager/user');
var Message = require('./message');
var EventProxy = require('eventproxy');
var _ = require('lodash');
var markdownit = require('./markdownit');
var linkify = markdownit.linkify;

/**
 * 从文本中提取出@username 标记的用户名数组
 * @param {String} text 文本内容
 * @return {Array} 用户名数组
 */
var fetchUsers = function(text) {


    if (!text) {
        return [];
    }
    var names = [];
    var matchs = linkify.match(text);
    var mentions = _.filter(matchs, {
        schema: '@'
    });
    _.map(mentions, function(o) {
        var name = _.replace(o.url, '/user/', '');
        if (name) {
            names.push(name);
        }
    });
    names = _.uniq(names);
    return names;
};
exports.fetchUsers = fetchUsers;


exports.sendMessageToMentionUsers = function(text, sender_id, topic_id, reply_id, callback) {
    if (typeof reply_id === 'function') {
        callback = reply_id;
        reply_id = null;
    }
    callback = callback || _.noop;

    var loginids = fetchUsers(text);
    userManager.getUsersByLoginids(loginids, function(err, users) {
        if (err || !users) {
            return callback(err);
        }
        var ep = new EventProxy();
        ep.fail(callback);

        users = users.filter(function(user) {
            return !user._id.equals(sender_id);
        });

        ep.after('sent', users.length, function() {
            callback();
        });

        users.forEach(function(user) {
            Message.sendAtMessage(sender_id, user._id, topic_id, reply_id, ep.done('sent'));
        });
    });
};