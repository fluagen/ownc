
var models = require('../model');
var Message = models.Message;



var Type = {
    Reply: 'reply', //回复话题
    At: {
        topic: 'at_topic', //话题中at
        reply: 'at_reply' //回复中at
    },
    Apply: {
        Organization: {
            join: 'apply_organization_join', // 请求加入xx
            pass: 'apply_organization_pass', // 申请加入xx的请求通过
            refuse: 'apply_organization_refuse' // 申请加入xx的请求被拒绝
        }
    }
};

exports = module.exports = Type;