var EventProxy = require('eventproxy');
var model = require('../model');
var Community = model.Community;

exports.create = function(req, res, next) {
    res.render('community/edit');
};
exports.put = function(req, res, next) {
    var name = req.body.name;
    var bio = req.body.bio;
    var user = req.session.user;

    var community = new Community();
    community.name = name;
    community.bio = bio;
    community.creator_id = user._id;
    community.members = [user._id];


    var ep = new EventProxy();
    ep.fail(next);
    ep.all('save', function(obj) {
        res.render('community/profile', {
            community: obj
        });
    });

    community.save(ep.done('save'));

};