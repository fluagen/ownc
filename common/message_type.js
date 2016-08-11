var Type = {
    Reply: 'reply', //回复话题
    At: {
        topic: 'at_topic', //话题中at
        reply: 'at_reply' //回复中at
    },
    Apply: {
        Qun: {
            join: 'apply_qun_join', // 请求加入xx
            pass: 'apply_qun_pass', // 申请加入xx的请求通过
            refuse: 'apply_qun_refuse' // 申请加入xx的请求被拒绝
        }
    }
};

exports = module.exports = Type;