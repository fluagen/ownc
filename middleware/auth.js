var config = require('../config');
var EventProxy = require('eventproxy');
var qunHelper = require('../common/qun_helper');
var model = require('../model');
var User = model.User;
var Qun = model.Qun;


exports.loginRequired = function(req, res, next) {
    res.render('sign/signin', {
        alertType: 'alert-danger',
        message: '需要登录，或会话已过期。'
    });
};

/**
 * 需要登录
 */
exports.userRequired = function(req, res, next) {
    if (!req.session || !req.session.user || !req.session.user._id) {
        return res.status(301).redirect('/login-required');
    }

    next();
};
exports.blockUser = function() {
    return function(req, res, next) {
        if (req.path === '/signout') {
            return next();
        }

        if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
            return res.renderError(403, '您已被管理员屏蔽了。');
        }
        next();
    };
};

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
        User.findById(user_id, ep.done('get_user'));
    }
};

/**
 * qun 权限验证
 */
exports.qunMemberRequired = function(req, res, next) {
    var qid = req.params.qid;
    if (typeof(qid) === 'undefined' || !qid) {
        return res.render404('群不存在，或已被删除。');
    }
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        if (!qun) {
            return res.render404('群不存在，或已被删除。');
        }
        if (!qunHelper.is_member(qun.members, user)) {
            return res.renderError(403, '你没有此操作权限。');
        }
        res.locals.qun = qun;
        req.body.qun = qun;
        next();
    });

    Qun.findOne({
        qid: qid
    }, ep.done('qun'));
};

exports.qunAdminRequired = function(req, res, next) {
    var qid = req.params.qid;
    if (typeof(qid) === 'undefined' || !qid) {
        return res.render404('群不存在，或已被删除。');
    }
    var user = req.session.user;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('qun', function(qun) {
        if (!qun) {
            return res.render404('群不存在，或已被删除。');
        }
        if (qun.creator_id !== user.loginid && !qunHelper.is_admin(qun.members, user)) {
            return res.renderError(403, '你没有此操作权限。');
        }
        res.locals.qun = qun;
        req.body.qun = qun;
        next();
    });

    Qun.findOne({
        qid: qid
    }, ep.done('qun'));
};