var validator = require('validator');
var EventProxy = require('eventproxy');
var userManager = require('../manager/user');
var auth = require('../middleware/auth');
var tools = require('../common/tools');

exports.showSignup = function(req, res, next) {
    res.render('sign/signup');
};

exports.signup = function(req, res, next) {
    var loginid = req.body.loginid;
    var passwd = req.body.passwd;
    var repasswd = req.body.repasswd;
    var email = req.body.email;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('prop_err', function(error) {
        return res.render('sign/signup', {
            loginid: loginid,
            email: email,
            msgtype: 'alert-danger',
            msg: error
        });
    });

    // 验证信息的完整性
    if ([loginid, passwd, repasswd, email].some(function(item) {
        return item === undefined || item === '';
    })) {
        ep.emit('prop_err', '注册信息不完整。');
        return;
    }

    loginid = validator.trim(loginid);
    email = validator.trim(email).toLowerCase();
    passwd = validator.trim(passwd);
    repasswd = validator.trim(repasswd);

    if (loginid.length < 5 || !tools.validateId(loginid)) {
        ep.emit('prop_err', '登录名至少5位字母、数字。');
        return;
    }
    if (!validator.isEmail(email)) {
        ep.emit('prop_err', '邮箱不合法。');
        return;
    }
    if (passwd !== repasswd) {
        ep.emit('prop_err', '两次密码输入不一致。');
        return;
    }
    if (passwd.length < 6) {
        ep.emit('prop_err', '密码至少需要6个字符。');
        return;
    }

    ep.all('reapt_user', function(users) {
        if (users.length > 0) {
            ep.emit('prop_err', '用户名或邮箱已被使用。');
            return;
        } else {
            ep.emit('validate_success');
        }
    });
    ep.all('user', function(user) {
        return res.render('sign/signup', {
            success: '注册成功'
        });
    });
    ep.all('validate_success', function() {
        tools.bhash(passwd, ep.done(function(hashpwd) {
            userManager.save(loginid, loginid, hashpwd, email, ep.done('user'));
        }));
    });
    var query = {
        '$or': [{
            'loginid': loginid
        }, {
            'email': email
        }]
    };
    userManager.getUsersByQuery(query, {}, ep.done('reapt_user'));
};

exports.showLogin = function(req, res, next) {
    res.render('sign/signin');
};

exports.login = function(req, res, next) {
    var loginid = req.body.loginid;
    var passwd = req.body.passwd;
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('prop_err', function(error) {
        return res.render('sign/signin', {
            loginid: loginid,
            msgtype: 'alert-danger',
            msg: error
        });
    });

    // 验证信息的完整性
    if ([loginid, passwd].some(function(item) {
        return item === undefined || validator.trim(item) === '';
    })) {
        ep.emit('prop_err', '登录名和密码不能为空。');
        return;
    }

    ep.all('user', function(user) {
        if (!user) {
            ep.emit('prop_err', '登录名或密码错误。');
            return;
        }
        tools.bcompare(passwd, user.passwd, ep.done(function(bool) {
            if (!bool) {
                ep.emit('prop_err', '登录名或密码错误。');
                return;
            }
            auth.gen_session(user, res);
            res.locals.current_user = req.session.user = user;
            res.redirect('/');
        }));
    });
    if (loginid.indexOf('@') !== -1) {
        userManager.getUserByEmail(loginid, ep.done('user'));
    } else {
        userManager.getUserByLoginid(loginid, ep.done('user'));
    }
};

exports.loginRequired = function(req, res, next) {
    res.render('sign/signin', {
        msgtype: 'alert-warning',
        msg: '需要登录后才能继续操作。'
    });
};