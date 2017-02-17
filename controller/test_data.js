var model = require('../model');
var User = model.User;
var Group = model.Group;
var tools = require('../common/tools');

exports.initUser = function(req, res, next) {

    tools.bhash("zhangsan", function(err,hashpwd) {
        var user = new User();
        user.loginid = "zhangsan";
        user.name = "zhangsan";
        user.passwd = hashpwd;
        user.email = "zhangsan@126.com";
        user.save();
    });

    tools.bhash("lisi", function(err,hashpwd) {
        var user = new User();
        user.loginid = "lisi";
        user.name = "lisi";
        user.passwd = hashpwd;
        user.email = "lisi@126.com";
        user.save();
    });

    tools.bhash("wangwu", function(err,hashpwd) {
        var user = new User();
        user.loginid = "wangwu";
        user.name = "wangwu";
        user.passwd = hashpwd;
        user.email = "wangwu@126.com";
        user.save();
    });

    tools.bhash("shenliu", function(err,hashpwd) {
        var user = new User();
        user.loginid = "shenliu";
        user.name = "shenliu";
        user.passwd = hashpwd;
        user.email = "shenliu@126.com";
        user.save();
    });

    next();
};

exports.initGroup = function(req, res, next) {
    var group = new Group();
    group.id = "qna";
    group.name = "问与答";
    group.bio = "一个更好的世界需要你持续地提出好问题。";
    group.save();

    group = new Group();
    group.id = "programmer";
    group.name = "程序员";
    group.bio = "While code monkeys are not eating bananas, they're coding.";
    group.save();

    group = new Group();
    group.id = "linux";
    group.name = "Linux";
    group.bio = "Linux is a Unix-like computer operating system assembled under the model of free and open source software development and distribution.";
    group.save();

    next();
};
