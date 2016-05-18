var config = require('../config');
var userManager = require('../manager/user');
var EventProxy = require('eventproxy');

function gen_session(user, res) {
    var auth_token = user._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
    var opts = {
        path: '/',
        maxAge: 1000 * 60 * 30,
        signed: true,
        httpOnly: true
    };
    res.cookie(config.auth_cookie_name, auth_token, opts); //cookie 有效期30分钟
}

exports.gen_session = gen_session;

// 验证用户是否登录
exports.authUser = function(req, res, next) {
    // Ensure current_user always has defined.
    res.locals.current_user = null;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('get_user', function(user) {
        res.locals.current_user = req.session.user = user;
        return next();
    });

    if (req.session.user) {
        ep.emit('get_user', req.session.user);
    } else {
        var auth_token = req.signedCookies[config.auth_cookie_name];
        if (!auth_token) {
            return next();
        }
        var auth = auth_token.split('$$$$');
        var user_id = auth[0];
        userManager.getUserById(user_id, ep.done('get_user'));
    }
};