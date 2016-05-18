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
console.log('loginid:'+loginid+",passwd:"+passwd+",repasswd:"+repasswd+",email:"+email);
    var ep = new EventProxy();
    ep.fail(next);

    ep.all('prop_err', function(error) {
        return res.render('sign/signup', {
            loginid: loginid,
            email: email,
            error: error
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

    if (loginid.length < 5 || tool.validateId(loginid)) {
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

exports.showSignin = function(req, res, next) {
    res.render('sign/signin');
};

exports.signin = function(req, res, next) {
    var loginid = req.body.loginid;
    var passwd = req.body.passwd;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('user', function(user) {
        console.log(user);
        if (!user || user.passwd !== passwd) {
            return res.send('用户名或密码错误');
        }
        auth.gen_session(user, res);
        //req.session.user = user;
        res.redirect('/');
    });
    userManager.getUserByLoginid(loginid, ep.done('user'));
};