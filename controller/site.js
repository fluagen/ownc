var EventProxy = require('eventproxy');

exports.index = function(req, res, next) {
    res.render('index', {});
};