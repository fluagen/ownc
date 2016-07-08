var model = require('../model');
var Community = model.Community;
var EventProxy = require('eventproxy');

exports.getById = function(id, callback) {
    Community.findOne({
        _id: id
    }, callback);
};

exports.getCommunitesByQuery = function(query, opt, callback) {
    Community.find(query, {}, opt, callback);
};