var _ = require('lodash');

exports.print = function(req, res, next) {
    var alerts = [];
    var user = req.session.user;
    if (user && user.alerts) {
        alerts = _.concat(alerts, user.alerts);
        delete user.alerts;
    }
    res.locals.alerts = alerts;
    next();
};
