var express = require('express');

var auth = require('./middleware/auth');
var upload = require('./middleware/upload');
var tab = require('./middleware/tab');

var site = require('./controller/site');
var sign = require('./controller/sign');
var topic = require('./controller/topic');
var reply = require('./controller/reply');
var message = require('./controller/message');
var community = require('./controller/community');
var qun = require('./controller/qun');


var router = express.Router();

// home page
router.get('/', tab.tab_open, site.index);

router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);
router.get('/signin', sign.showLogin);
router.post('/signin', sign.login);
router.get('/logout', sign.logout);
router.get('/login-required', sign.loginRequired);


router.get('/topic/create', auth.userRequired, topic.create);
router.post('/topic/create', auth.userRequired, topic.put);
router.get('/topic/:tid', topic.index);
router.post('/topic/:tid/collect', auth.userRequired, topic.collect);
router.post('/topic/:tid/follow', auth.userRequired, topic.follow);

router.post('/:tid/reply', auth.userRequired, reply.add);
// router.get('/reply/:reply_id/edit', auth.userRequired, reply.showEdit);
// router.post('/reply/:reply_id/edit', auth.userRequired, reply.update);
router.post('/reply/:reply_id/up', auth.userRequired, reply.up);

router.get('/message', auth.userRequired, message.index);

router.get('/qun/list', qun.list);
router.get('/qun/create', auth.userRequired, qun.create);
router.post('/qun/create', auth.userRequired, qun.put);
router.get('/qun/:qid', qun.index);
router.get('/qun/:qid/topic/create', auth.userRequired, auth.qunMemberRequired, topic.create);
router.post('/qun/:qid/topic/create', auth.userRequired, auth.qunMemberRequired, topic.put);
router.post('/qun/:qid/i/code/create',  qun.invitation);
router.post('/qun/:qid/i/join', qun.join);


router.post('/upload', upload.image);

module.exports = router;