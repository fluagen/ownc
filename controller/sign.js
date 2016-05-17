var EventProxy = require('eventproxy');
var userManager = require('../manager/user');

exports.showSignup = function(req, res, next){
	res.render('sign/signup', {});
};

exports.signup = function(req, res, next) {
    var loginid = req.body.loginid;
    var passwd = req.body.passwd;
    var email = req.body.email;

    var ep = new EventProxy();
    ep.fail(next);
    ep.all('user', function(user) {
        if (!user) {
            return res.render('sign/signup', {
                error: '注册失败'
            });
        }
        res.send('注册成功');
    });

    userManager.save(loginid, loginid, email, passwd, ep.done('user'));
};

exports.signin = function(req, res, next) {
    var loginid = req.body.loginid;
    var passwd = req.body.passwd;
    var ep = new EventProxy();
    ep.fail(next);
    ep.all('user', function(user) {
        if (user.passwd === passwd) {
            return res.render('index', {});
        } else {
            return res.render('sign/signin', {});
        }
    });
    userManager.getUserById(loginid, ep.done('user'));
};