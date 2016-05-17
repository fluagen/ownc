var model = require('../model');
var Group = model.Group;
var EventProxy = require('eventporxy');

exports.getGroupById = function(id, callback) {
    Group.findOne({
        _id: id
    }, callback);
};

exports.save = function(name, email, pagehome, introduction, callback) {

    var group = new Group();
    group.name = name;
    group.email = email;
    group.pagehome = pagehome;
    group.introduction = introduction;
    group.save(callback);
};