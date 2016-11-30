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
router.get('/', tab.com, site.index);
router.get('/follow', auth.userRequired, site.follow);

router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);
router.get('/signin', sign.showLogin);
router.post('/signin', sign.login);
router.get('/logout', sign.logout);
router.get('/login-required', auth.loginRequired);


router.get('/topic/create', auth.userRequired, tab.com, topic.create);
router.post('/topic/create', auth.userRequired, topic.put);
router.get('/topic/:tid', tab.com, topic.index);
router.post('/topic/:tid/collect', auth.userRequired, topic.collect);
router.post('/topic/:tid/follow', auth.userRequired, topic.follow);

router.post('/:tid/reply', auth.userRequired, reply.add);
// router.get('/reply/:reply_id/edit', auth.userRequired, reply.showEdit);
// router.post('/reply/:reply_id/edit', auth.userRequired, reply.update);
router.post('/reply/:reply_id/up', auth.userRequired, reply.up);

router.get('/message', auth.userRequired, message.index);


router.get('/qun/explore', qun.explore);

// router.get('/qun', qun.list);
// router.get('/qun/list', qun.list);
// router.get('/qun/create', auth.userRequired, qun.create);
// router.post('/qun/create', auth.userRequired, qun.put);
// router.get('/qun/:qid', qun.index);
// router.get('/qun/:qid/topic/create', auth.userRequired, auth.qunMemberRequired, topic.create);
// router.post('/qun/:qid/topic/create', auth.userRequired, auth.qunMemberRequired, topic.put);
// router.get('/qun/:qid/i/code/create',  auth.userRequired, auth.qunAdminRequired, qun.createInvitation);
// router.get('/qun/:qid/invitation',  auth.userRequired, auth.qunAdminRequired, qun.invitation);
// router.get('/qun/:qid/join', auth.userRequired, qun.join);
// router.post('/qun/:qid/join', auth.userRequired, qun.checkInvitation);




router.post('/upload', upload.image);

module.exports = router;